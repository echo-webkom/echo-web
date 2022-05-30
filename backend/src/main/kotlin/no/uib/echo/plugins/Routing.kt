package no.uib.echo.plugins

import com.auth0.jwk.JwkProviderBuilder
import io.ktor.http.ContentDisposition
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.UserIdPrincipal
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.basic
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.jwt.jwt
import io.ktor.server.auth.principal
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation
import io.ktor.server.request.receive
import io.ktor.server.response.header
import io.ktor.server.response.respond
import io.ktor.server.response.respondBytes
import io.ktor.server.routing.Route
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.put
import io.ktor.server.routing.routing
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import no.uib.echo.FeatureToggles
import no.uib.echo.RegistrationResponse
import no.uib.echo.isEmailValid
import no.uib.echo.plugins.Routing.deleteHappening
import no.uib.echo.plugins.Routing.deleteRegistration
import no.uib.echo.plugins.Routing.getHappeningInfo
import no.uib.echo.plugins.Routing.getRegistrations
import no.uib.echo.plugins.Routing.getStatus
import no.uib.echo.plugins.Routing.getUser
import no.uib.echo.plugins.Routing.postRegistration
import no.uib.echo.plugins.Routing.postRegistrationCount
import no.uib.echo.plugins.Routing.putHappening
import no.uib.echo.plugins.Routing.putUser
import no.uib.echo.resToJson
import no.uib.echo.schema.Answer
import no.uib.echo.schema.AnswerJson
import no.uib.echo.schema.Degree
import no.uib.echo.schema.HAPPENING_TYPE
import no.uib.echo.schema.Happening
import no.uib.echo.schema.HappeningInfoJson
import no.uib.echo.schema.HappeningJson
import no.uib.echo.schema.Registration
import no.uib.echo.schema.RegistrationCountJson
import no.uib.echo.schema.RegistrationJson
import no.uib.echo.schema.SlugJson
import no.uib.echo.schema.SpotRange
import no.uib.echo.schema.SpotRangeWithCountJson
import no.uib.echo.schema.User
import no.uib.echo.schema.UserJson
import no.uib.echo.schema.bachelors
import no.uib.echo.schema.countRegistrationsDegreeYear
import no.uib.echo.schema.insertOrUpdateHappening
import no.uib.echo.schema.masters
import no.uib.echo.schema.selectSpotRanges
import no.uib.echo.schema.toCsv
import no.uib.echo.schema.validateLink
import no.uib.echo.sendConfirmationEmail
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.batchInsert
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.lowerCase
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import org.joda.time.DateTime
import java.net.URL
import java.net.URLDecoder
import java.util.concurrent.TimeUnit

fun Application.configureRouting(
    adminKey: String,
    sendGridApiKey: String?,
    dev: Boolean,
    featureToggles: FeatureToggles
) {
    val admin = "admin"

    install(ContentNegotiation) {
        json()
    }

    install(Authentication) {
        basic("auth-$admin") {
            realm = "Access to registrations and happenings."
            validate { credentials ->
                if (credentials.name == admin && credentials.password == adminKey)
                    UserIdPrincipal(credentials.name)
                else
                    null
            }
        }

        val issuer = "https://auth.dataporten.no/openid/jwks"
        val jwkProvider = JwkProviderBuilder(URL(issuer))
            .cached(10, 24, TimeUnit.HOURS)
            .rateLimited(10, 1, TimeUnit.MINUTES)
            .build()

        jwt("auth-jwt") {
            realm = "Verify jwt"
            verifier(jwkProvider, issuer) {
                acceptLeeway(3)
                withIssuer("https://auth.dataporten.no")
            }
            validate { jwtCredential ->
                println(jwtCredential.payload)
                JWTPrincipal(jwtCredential.payload)
            }
        }
    }

    routing {
        getStatus()

        authenticate("auth-$admin") {
            putHappening(sendGridApiKey, featureToggles.sendEmailHap, dev)
            deleteHappening()
            getHappeningInfo()
        }

        authenticate("auth-jwt") {
            getUser()
            putUser()
        }

        getRegistrations(dev)
        postRegistration(sendGridApiKey, featureToggles.sendEmailReg, featureToggles.verifyRegs)
        deleteRegistration(dev)
        postRegistrationCount()
    }
}

object Routing {
    const val getStatusRoute = "/status"

    const val putHappeningRoute = "/happening/{slug}"
    const val getHappeningInfoRoute = "/happening/{slug}"
    const val deleteHappeningRoute = "/happening/{slug}"

    const val getRegistrationsRoute = "/happening/{link}/registrations"
    const val postRegistrationRoute = "/happening/{slug}/registrations"

    const val postRegistrationCountRoute = "/happening/count/registrations"

    const val getUserRoute = "/user/{email}"
    const val putUserRoute = "/user/{email}"

    const val deleteRegistrationRoute = "/happening/{link}/registrations/{email}"

    fun Route.getStatus() {
        get(getStatusRoute) {
            call.respond(HttpStatusCode.OK)
        }
    }

    fun Route.getUser() {
        get(getUserRoute) {
            val principal = call.principal<JWTPrincipal>()
            val jwtEmail = principal!!.payload.getClaim("email").asString()
            val paramEmail = call.parameters["email"]

            if (jwtEmail != paramEmail) {
                // Can only get your own user (so where emails match)
                call.respond(HttpStatusCode.Unauthorized)
                return@get
            }

            val user = transaction {
                addLogger(StdOutSqlLogger)
                User.select {
                    User.email eq jwtEmail
                }.firstOrNull()
            }

            if (user == null) {
                call.respond(HttpStatusCode.NotFound, "User with email not found (email = $jwtEmail).")
                return@get
            }

            call.respond(HttpStatusCode.OK, UserJson(user[User.degreeYear], Degree.valueOf(user[User.degree])))
        }
    }

    fun Route.putUser() {
        put(putUserRoute) {
            try {
                val user = call.receive<UserJson>()

                val principal = call.principal<JWTPrincipal>()
                val jwtEmail = principal!!.payload.getClaim("email").asString()
                val paramEmail = call.parameters["email"]

                if (jwtEmail != paramEmail) {
                    // Can only PUT your own user (so where emails match)
                    call.respond(HttpStatusCode.Unauthorized)
                    return@put
                }

                val result = transaction {
                    addLogger(StdOutSqlLogger)
                    User.select {
                        User.email eq jwtEmail
                    }.firstOrNull()
                }

                if (result == null) {
                    transaction {
                        addLogger(StdOutSqlLogger)
                        User.insert {
                            it[email] = jwtEmail
                            it[degree] = user.degree.toString()
                            it[degreeYear] = user.degreeYear
                        }
                    }
                    call.respond(HttpStatusCode.OK, "User created with email = $jwtEmail")
                    return@put
                }

                transaction {
                    addLogger(StdOutSqlLogger)
                    User.update({
                        User.email eq jwtEmail
                    }) {
                        it[degree] = user.degree.toString()
                        it[degreeYear] = user.degreeYear
                    }
                }

                call.respond(
                    HttpStatusCode.OK,
                    "User updated with email = $jwtEmail, degree = ${user.degree}, degreeYear = ${user.degreeYear}"
                )
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError)
                e.printStackTrace()
            }
        }
    }

    fun Route.getHappeningInfo() {
        get(getHappeningInfoRoute) {
            val slug = call.parameters["slug"]

            if (slug == null) {
                call.respond(HttpStatusCode.BadRequest, "No slug specified.")
                return@get
            }

            val happening = transaction {
                addLogger(StdOutSqlLogger)

                Happening.select {
                    Happening.slug eq slug
                }.firstOrNull()
            }

            if (happening == null) {
                call.respond(HttpStatusCode.NotFound, "Happening doesn't exist.")
                return@get
            }

            val registrationCount = transaction {
                addLogger(StdOutSqlLogger)

                SpotRange.select {
                    SpotRange.happeningSlug eq slug
                }.toList().map {
                    SpotRangeWithCountJson(
                        it[SpotRange.spots],
                        it[SpotRange.minDegreeYear],
                        it[SpotRange.maxDegreeYear],
                        countRegistrationsDegreeYear(
                            slug,
                            it[SpotRange.minDegreeYear]..it[SpotRange.maxDegreeYear],
                            false
                        ),
                        countRegistrationsDegreeYear(
                            slug,
                            it[SpotRange.minDegreeYear]..it[SpotRange.maxDegreeYear],
                            true
                        )
                    )
                }
            }

            call.respond(
                HttpStatusCode.OK,
                HappeningInfoJson(
                    registrationCount,
                    happening[Happening.regVerifyToken]
                )
            )
        }
    }

    fun Route.getRegistrations(dev: Boolean) {
        get(getRegistrationsRoute) {
            val link = call.parameters["link"]
            val download = call.request.queryParameters["download"] != null
            val json = call.request.queryParameters["json"] != null
            val testing = call.request.queryParameters["testing"] != null

            val hap = validateLink(link, dev)

            if (hap == null) {
                call.respond(HttpStatusCode.NotFound)
                return@get
            }

            val regs = transaction {
                addLogger(StdOutSqlLogger)

                Registration.select {
                    Registration.happeningSlug eq hap[Happening.slug]
                }.orderBy(Registration.submitDate to SortOrder.ASC).toList().map { reg ->
                    RegistrationJson(
                        reg[Registration.email].lowercase(),
                        reg[Registration.firstName],
                        reg[Registration.lastName],
                        Degree.valueOf(reg[Registration.degree]),
                        reg[Registration.degreeYear],
                        reg[Registration.terms],
                        reg[Registration.submitDate].toString(),
                        reg[Registration.waitList],
                        transaction {
                            addLogger(StdOutSqlLogger)

                            Answer.select {
                                Answer.registrationEmail.lowerCase() eq reg[Registration.email].lowercase() and
                                    (Answer.happeningSlug eq hap[Happening.slug])
                            }.toList()
                        }.map {
                            AnswerJson(
                                it[Answer.question],
                                it[Answer.answer]
                            )
                        },
                        HAPPENING_TYPE.valueOf(hap[Happening.happeningType]),
                        null
                    )
                }
            }

            if (download) {
                val fileName = "pameldte-${hap[Happening.slug]}.csv"

                call.response.header(
                    HttpHeaders.ContentDisposition,
                    ContentDisposition.Attachment.withParameter(
                        ContentDisposition.Parameters.FileName,
                        fileName
                    ).toString()
                )
                call.respondBytes(
                    contentType = ContentType.parse("text/csv"),
                    provider = { toCsv(regs, testing = testing).toByteArray() }
                )
            } else if (json) {
                call.respond(regs)
            } else {
                call.response.header(
                    HttpHeaders.Location,
                    "https://echo.uib.no/registrations/$link"
                )
                call.respond(HttpStatusCode.MovedPermanently)
            }
        }
    }

    fun Route.postRegistration(sendGridApiKey: String?, sendEmail: Boolean, verifyRegs: Boolean) {
        post(postRegistrationRoute) {
            try {
                val registration = call.receive<RegistrationJson>()
                val slug = call.parameters["slug"]

                if (slug == null) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        resToJson(RegistrationResponse.HappeningDoesntExist, registration.type)
                    )
                    return@post
                }

                if (!isEmailValid(registration.email)) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        resToJson(RegistrationResponse.InvalidEmail, registration.type)
                    )
                    return@post
                }

                if (registration.degreeYear !in 1..5) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        resToJson(RegistrationResponse.InvalidDegreeYear, registration.type)
                    )
                    return@post
                }

                if (registration.degree in bachelors && registration.degreeYear !in 1..3) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        resToJson(RegistrationResponse.DegreeMismatchBachelor, registration.type)
                    )
                    return@post
                }

                if (registration.degree in masters && registration.degreeYear !in 4..5) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        resToJson(RegistrationResponse.DegreeMismatchMaster, registration.type)
                    )
                    return@post
                }

                if (!registration.terms) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        resToJson(RegistrationResponse.InvalidTerms, registration.type)
                    )
                    return@post
                }

                val happening = transaction {
                    addLogger(StdOutSqlLogger)

                    Happening.select {
                        Happening.slug eq slug
                    }.firstOrNull()
                }

                if (happening == null) {
                    call.respond(
                        HttpStatusCode.Conflict,
                        resToJson(RegistrationResponse.HappeningDoesntExist, registration.type)
                    )
                    return@post
                }

                if (happening[Happening.regVerifyToken] != registration.regVerifyToken && verifyRegs) {
                    call.respond(
                        HttpStatusCode.Unauthorized,
                        resToJson(RegistrationResponse.NotViaForm, registration.type)
                    )
                    return@post
                }

                if (DateTime(happening[Happening.registrationDate]).isAfterNow) {
                    call.respond(
                        HttpStatusCode.Forbidden,
                        resToJson(
                            RegistrationResponse.TooEarly,
                            registration.type,
                            regDate = happening[Happening.registrationDate].toString()
                        )
                    )
                    return@post
                }

                if (DateTime(happening[Happening.happeningDate]).isBeforeNow) {
                    call.respond(
                        HttpStatusCode.Forbidden,
                        resToJson(RegistrationResponse.TooLate, registration.type)
                    )
                    return@post
                }

                val spotRanges = selectSpotRanges(slug)

                val correctRange = spotRanges.firstOrNull {
                    registration.degreeYear in it.minDegreeYear..it.maxDegreeYear
                }

                if (correctRange == null) {
                    call.respond(
                        HttpStatusCode.Forbidden,
                        resToJson(RegistrationResponse.NotInRange, registration.type, spotRanges = spotRanges)
                    )
                    return@post
                }

                val countRegsInSpotRange = transaction {
                    addLogger(StdOutSqlLogger)

                    Registration.select {
                        Registration.happeningSlug eq slug and
                            (Registration.degreeYear inList correctRange.minDegreeYear..correctRange.maxDegreeYear)
                    }.count()
                }

                val spotRangeOnWaitList = transaction {
                    addLogger(StdOutSqlLogger)

                    Registration.select {
                        Registration.happeningSlug eq slug and
                            (
                                Registration.degreeYear inList correctRange.minDegreeYear..correctRange.maxDegreeYear and
                                    (Registration.waitList eq true)
                                )
                    }.count()
                }

                val waitList = correctRange.spots in 1..countRegsInSpotRange || spotRangeOnWaitList > 0
                val waitListSpot = spotRangeOnWaitList + 1

                val oldReg = transaction {
                    addLogger(StdOutSqlLogger)

                    Registration.select {
                        Registration.email.lowerCase() eq registration.email.lowercase() and
                            (Registration.happeningSlug eq slug)
                    }.firstOrNull()
                }

                if (oldReg != null) {
                    val responseCode = when (oldReg[Registration.waitList]) {
                        true -> RegistrationResponse.AlreadySubmittedWaitList
                        false -> RegistrationResponse.AlreadySubmitted
                    }
                    call.respond(
                        HttpStatusCode.UnprocessableEntity,
                        resToJson(responseCode, registration.type)
                    )
                    return@post
                }

                transaction {
                    addLogger(StdOutSqlLogger)

                    Registration.insert {
                        it[email] = registration.email.lowercase()
                        it[firstName] = registration.firstName
                        it[lastName] = registration.lastName
                        it[degree] = registration.degree.toString()
                        it[degreeYear] = registration.degreeYear
                        it[happeningSlug] = slug
                        it[terms] = true
                        it[Registration.waitList] = waitList
                    }

                    if (registration.answers.isNotEmpty()) {
                        Answer.batchInsert(registration.answers) { a ->
                            this[Answer.registrationEmail] = registration.email.lowercase()
                            this[Answer.happeningSlug] = slug
                            this[Answer.question] = a.question
                            this[Answer.answer] = a.answer
                        }
                    }
                }

                if (waitList) {
                    call.respond(
                        HttpStatusCode.Accepted,
                        resToJson(RegistrationResponse.WaitList, registration.type, waitListSpot = waitListSpot)
                    )

                    if (sendGridApiKey == null || !sendEmail)
                        return@post

                    sendConfirmationEmail(sendGridApiKey, registration, slug, waitListSpot)
                } else {
                    call.respond(HttpStatusCode.OK, resToJson(RegistrationResponse.OK, registration.type))

                    if (sendGridApiKey == null || !sendEmail)
                        return@post

                    sendConfirmationEmail(sendGridApiKey, registration, slug, null)
                }
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError)
                e.printStackTrace()
            }
        }
    }

    fun Route.deleteRegistration(dev: Boolean) {
        delete(deleteRegistrationRoute) {
            val link = call.parameters["link"]

            val email = withContext(Dispatchers.IO) {
                URLDecoder.decode(call.parameters["email"], "utf-8")
            }

            val hap = validateLink(link, dev)

            if (hap == null || email == null) {
                call.respond(HttpStatusCode.NotFound)
                return@delete
            }

            try {
                val reg = transaction {
                    addLogger(StdOutSqlLogger)

                    Registration.select {
                        Registration.happeningSlug eq hap[Happening.slug] and
                            (Registration.email.lowerCase() eq email.lowercase())
                    }.firstOrNull()
                }

                if (reg == null) {
                    call.respond(HttpStatusCode.BadRequest)
                    return@delete
                }

                transaction {
                    addLogger(StdOutSqlLogger)

                    Answer.deleteWhere {
                        Answer.happeningSlug eq hap[Happening.slug] and
                            (Answer.registrationEmail.lowerCase() eq email.lowercase())
                    }

                    Registration.deleteWhere {
                        Registration.happeningSlug eq hap[Happening.slug] and
                            (Registration.email.lowerCase() eq email.lowercase())
                    }
                }

                if (reg[Registration.waitList]) {
                    call.respond(
                        HttpStatusCode.OK,
                        "Registration with email = ${email.lowercase()} and slug = ${hap[Happening.slug]} deleted."
                    )
                    return@delete
                }

                val highestOnWaitList = transaction {
                    addLogger(StdOutSqlLogger)

                    Registration.select {
                        Registration.waitList eq true
                    }.orderBy(Registration.submitDate).firstOrNull()
                }

                if (highestOnWaitList == null) {
                    call.respond(
                        HttpStatusCode.OK,
                        "Registration with email = ${email.lowercase()} and slug = ${hap[Happening.slug]} deleted."
                    )
                } else {
                    transaction {
                        addLogger(StdOutSqlLogger)

                        Registration.update({ Registration.email eq highestOnWaitList[Registration.email].lowercase() and (Registration.happeningSlug eq hap[Happening.slug]) }) {
                            it[waitList] = false
                        }
                    }
                    call.respond(
                        HttpStatusCode.OK,
                        "Registration with email = ${email.lowercase()} and slug = ${hap[Happening.slug]} deleted, " +
                            "and registration with email = ${highestOnWaitList[Registration.email].lowercase()} moved off wait list."
                    )
                }
            } catch (e: Exception) {
                call.respond(HttpStatusCode.BadRequest, "Error deleting registration.")
                e.printStackTrace()
            }
        }
    }

    fun Route.putHappening(sendGridApiKey: String?, sendEmail: Boolean, dev: Boolean) {
        put(putHappeningRoute) {
            val slug = call.parameters["slug"]

            if (slug == null) {
                call.respond(HttpStatusCode.BadRequest, "No slug specified.")
                return@put
            }

            try {
                val hap = call.receive<HappeningJson>()
                val result = insertOrUpdateHappening(hap, slug, sendGridApiKey, sendEmail, dev)

                call.respond(result.first, result.second)
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, "Error submitting happening.")
                e.printStackTrace()
            }
        }
    }

    fun Route.deleteHappening() {
        delete(deleteHappeningRoute) {
            val slug = call.parameters["slug"]

            if (slug == null) {
                call.respond(HttpStatusCode.BadRequest, "No slug specified.")
                return@delete
            }

            val hapDeleted = transaction {
                addLogger(StdOutSqlLogger)

                val happeningExists = Happening.select { Happening.slug eq slug }.firstOrNull() != null
                if (!happeningExists)
                    return@transaction false

                SpotRange.deleteWhere {
                    SpotRange.happeningSlug eq slug
                }

                Answer.deleteWhere {
                    Answer.happeningSlug eq slug
                }

                Registration.deleteWhere {
                    Registration.happeningSlug eq slug
                }

                Happening.deleteWhere {
                    Happening.slug eq slug
                }

                return@transaction true
            }

            if (hapDeleted)
                call.respond(
                    HttpStatusCode.OK,
                    "Happening with slug = $slug deleted."
                )
            else
                call.respond(
                    HttpStatusCode.NotFound,
                    "Happening with slug = $slug does not exist."
                )
        }
    }

    fun Route.postRegistrationCount() {
        post(postRegistrationCountRoute) {
            try {
                val slugs = call.receive<SlugJson>().slugs
                val registrationCounts = transaction {
                    addLogger(StdOutSqlLogger)

                    slugs.map {
                        val count = Registration.select {
                            Registration.happeningSlug eq it and (Registration.waitList eq false)
                        }.count()

                        val waitListCount = Registration.select {
                            Registration.happeningSlug eq it and (Registration.waitList eq true)
                        }.count()

                        RegistrationCountJson(it, count, waitListCount)
                    }
                }

                call.respond(
                    HttpStatusCode.OK,
                    registrationCounts
                )
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError)
                e.printStackTrace()
            }
        }
    }
}
