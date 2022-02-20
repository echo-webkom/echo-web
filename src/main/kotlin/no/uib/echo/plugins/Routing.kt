package no.uib.echo.plugins

import guru.zoroark.ratelimit.RateLimit
import guru.zoroark.ratelimit.rateLimited
import io.ktor.application.Application
import io.ktor.application.call
import io.ktor.application.install
import io.ktor.auth.Authentication
import io.ktor.auth.UserIdPrincipal
import io.ktor.auth.authenticate
import io.ktor.auth.basic
import io.ktor.features.ContentNegotiation
import io.ktor.gson.gson
import io.ktor.http.ContentDisposition
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.request.receive
import io.ktor.response.header
import io.ktor.response.respond
import io.ktor.response.respondBytes
import io.ktor.routing.Route
import io.ktor.routing.delete
import io.ktor.routing.get
import io.ktor.routing.post
import io.ktor.routing.put
import io.ktor.routing.routing
import no.uib.echo.FeatureToggles
import no.uib.echo.Response
import no.uib.echo.plugins.Routing.deleteHappening
import no.uib.echo.plugins.Routing.deleteRegistration
import no.uib.echo.plugins.Routing.getRegistrationCount
import no.uib.echo.plugins.Routing.getRegistrations
import no.uib.echo.plugins.Routing.getStatus
import no.uib.echo.plugins.Routing.postRegistration
import no.uib.echo.plugins.Routing.putHappening
import no.uib.echo.resToJson
import no.uib.echo.schema.Answer
import no.uib.echo.schema.AnswerJson
import no.uib.echo.schema.Degree
import no.uib.echo.schema.HAPPENING_TYPE
import no.uib.echo.schema.Happening
import no.uib.echo.schema.Happening.slug
import no.uib.echo.schema.HappeningJson
import no.uib.echo.schema.HappeningSlugJson
import no.uib.echo.schema.Registration
import no.uib.echo.schema.RegistrationJson
import no.uib.echo.schema.ShortRegistrationJson
import no.uib.echo.schema.SpotRange
import no.uib.echo.schema.SpotRangeWithCountJson
import no.uib.echo.schema.countRegistrationsDegreeYear
import no.uib.echo.schema.insertOrUpdateHappening
import no.uib.echo.schema.selectHappening
import no.uib.echo.schema.selectSpotRanges
import no.uib.echo.schema.toCsv
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
import org.joda.time.DateTime
import java.time.Duration

fun Application.configureRouting(
    adminKey: String,
    sendGridApiKey: String?,
    featureToggles: FeatureToggles
) {
    val admin = "admin"

    install(ContentNegotiation) {
        gson()
    }

    install(RateLimit) {
        limit = 200
        timeBeforeReset = if (featureToggles.rateLimit) Duration.ofMinutes(2) else Duration.ZERO
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
    }

    routing {
        rateLimited {
            getStatus()

            authenticate("auth-$admin") {
                deleteRegistration()
                putHappening(sendGridApiKey, featureToggles.sendEmailHap)
                deleteHappening()
                getRegistrationCount()
            }

            getRegistrations()
            postRegistration(sendGridApiKey, featureToggles.sendEmailReg)
        }
    }
}

object Routing {
    const val registrationRoute: String = "registration"
    const val happeningRoute: String = "happening"

    fun Route.getStatus() {
        get("/status") {
            call.respond(HttpStatusCode.OK)
        }
    }

    fun Route.getRegistrationCount() {
        get("/$registrationRoute") {
            val slugParam: String? = call.request.queryParameters["slug"]

            if (slugParam != null) {
                val registrationCount = transaction {
                    addLogger(StdOutSqlLogger)

                    SpotRange.select {
                        SpotRange.happeningSlug eq slugParam
                    }.toList().map {
                        SpotRangeWithCountJson(
                            it[SpotRange.spots],
                            it[SpotRange.minDegreeYear],
                            it[SpotRange.maxDegreeYear],
                            countRegistrationsDegreeYear(
                                slugParam,
                                it[SpotRange.minDegreeYear]..it[SpotRange.maxDegreeYear],
                                false
                            ),
                            countRegistrationsDegreeYear(
                                slugParam,
                                it[SpotRange.minDegreeYear]..it[SpotRange.maxDegreeYear],
                                true
                            )
                        )
                    }
                }

                call.respond(HttpStatusCode.OK, registrationCount)
                return@get
            } else {
                call.respond(HttpStatusCode.BadRequest, "No slug specified.")
                return@get
            }
        }
    }

    fun Route.getRegistrations() {
        get("/$registrationRoute/{link}") {
            val link = call.parameters["link"]
            val download = call.request.queryParameters["download"] != null
            val json = call.request.queryParameters["json"] != null
            val testing = call.request.queryParameters["testing"] != null

            if ((link == null) || (link.length < 128)) {
                call.respond(HttpStatusCode.NotFound)
                return@get
            }

            val hap = transaction {
                addLogger(StdOutSqlLogger)

                Happening.select {
                    Happening.registrationsLink eq link
                }.firstOrNull()
            }

            if (hap == null) {
                call.respond(HttpStatusCode.NotFound)
                return@get
            }

            val regs = transaction {
                addLogger(StdOutSqlLogger)

                Registration.select {
                    Registration.happeningSlug eq hap[slug]
                }.orderBy(Registration.submitDate to SortOrder.ASC).toList().map { reg ->
                    RegistrationJson(
                        reg[Registration.email].lowercase(),
                        reg[Registration.firstName],
                        reg[Registration.lastName],
                        Degree.valueOf(reg[Registration.degree]),
                        reg[Registration.degreeYear],
                        reg[Registration.happeningSlug],
                        reg[Registration.terms],
                        reg[Registration.submitDate].toString(),
                        reg[Registration.waitList],
                        transaction {
                            addLogger(StdOutSqlLogger)

                            Answer.select {
                                Answer.registrationEmail.lowerCase() eq reg[Registration.email].lowercase() and
                                    (Answer.happeningSlug eq hap[slug])
                            }.toList()
                        }.map {
                            AnswerJson(
                                it[Answer.question],
                                it[Answer.answer]
                            )
                        },
                        HAPPENING_TYPE.valueOf(hap[Happening.happeningType])
                    )
                }
            }

            if (download) {
                val fileName = "pameldte-${hap[slug]}.csv"

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
                    "https://echo.uib.no/$registrationRoute/$link"
                )
                call.respond(HttpStatusCode.MovedPermanently)
            }
        }
    }

    fun Route.postRegistration(sendGridApiKey: String?, sendEmail: Boolean) {
        post("/$registrationRoute") {
            try {
                val registration = call.receive<RegistrationJson>()

                if (!registration.email.contains('@')) {
                    call.respond(HttpStatusCode.BadRequest, resToJson(Response.InvalidEmail, registration.type))
                    return@post
                }

                if (registration.degreeYear !in 1..5) {
                    call.respond(HttpStatusCode.BadRequest, resToJson(Response.InvalidDegreeYear, registration.type))
                    return@post
                }

                if ((
                    registration.degree == Degree.DTEK ||
                        registration.degree == Degree.DSIK ||
                        registration.degree == Degree.DVIT ||
                        registration.degree == Degree.BINF ||
                        registration.degree == Degree.IMO ||
                        registration.degree == Degree.IKT ||
                        registration.degree == Degree.KOGNI ||
                        registration.degree == Degree.ARMNINF
                    ) && registration.degreeYear !in 1..3
                ) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        resToJson(Response.DegreeMismatchBachelor, registration.type)
                    )
                    return@post
                }

                if ((registration.degree == Degree.INF || registration.degree == Degree.PROG) && (registration.degreeYear !in 4..5)) {
                    call.respond(HttpStatusCode.BadRequest, resToJson(Response.DegreeMismatchMaster, registration.type))
                    return@post
                }

                if (registration.degree == Degree.ARMNINF && registration.degreeYear != 1) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        resToJson(Response.DegreeMismatchArmninf, registration.type)
                    )
                    return@post
                }

                if (registration.degree == Degree.KOGNI && registration.degreeYear != 3) {
                    call.respond(HttpStatusCode.BadRequest, resToJson(Response.DegreeMismatchKogni, registration.type))
                    return@post
                }

                if (!registration.terms) {
                    call.respond(HttpStatusCode.BadRequest, resToJson(Response.InvalidTerms, registration.type))
                    return@post
                }

                val happening = transaction {
                    addLogger(StdOutSqlLogger)

                    selectHappening(registration.slug)
                }

                if (happening == null) {
                    call.respond(
                        HttpStatusCode.Conflict,
                        resToJson(Response.HappeningDoesntExist, registration.type)
                    )
                    return@post
                }

                if (DateTime(happening.registrationDate).isAfterNow) {
                    call.respond(
                        HttpStatusCode.Forbidden,
                        resToJson(Response.TooEarly, registration.type, regDate = happening.registrationDate)
                    )
                    return@post
                }

                val spotRanges = selectSpotRanges(registration.slug)

                val correctRange = happening.spotRanges.firstOrNull {
                    registration.degreeYear in it.minDegreeYear..it.maxDegreeYear
                }

                if (correctRange == null) {
                    call.respond(
                        HttpStatusCode.Forbidden,
                        resToJson(Response.NotInRange, registration.type, spotRanges = spotRanges)
                    )
                    return@post
                }

                val countRegs = transaction {
                    addLogger(StdOutSqlLogger)

                    Registration.select {
                        Registration.happeningSlug eq registration.slug and
                            (Registration.degreeYear inList correctRange.minDegreeYear..correctRange.maxDegreeYear)
                    }.count()
                }

                val waitList = correctRange.spots in 1..countRegs
                val waitListSpot = countRegs - correctRange.spots + 1

                val oldReg = transaction {
                    addLogger(StdOutSqlLogger)

                    Registration.select {
                        Registration.email.lowerCase() eq registration.email.lowercase() and
                            (Registration.happeningSlug eq registration.slug)
                    }.firstOrNull()
                }

                if (oldReg != null) {
                    val responseCode = when (oldReg[Registration.waitList]) {
                        true -> Response.AlreadySubmittedWaitList
                        false -> Response.AlreadySubmitted
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
                        it[happeningSlug] = registration.slug
                        it[terms] = registration.terms
                        it[Registration.waitList] = waitList
                    }

                    if (registration.answers.isNotEmpty()) {
                        Answer.batchInsert(registration.answers) { a ->
                            this[Answer.registrationEmail] = registration.email.lowercase()
                            this[Answer.happeningSlug] = registration.slug
                            this[Answer.question] = a.question
                            this[Answer.answer] = a.answer
                        }
                    }
                }

                if (waitList) {
                    call.respond(
                        HttpStatusCode.Accepted,
                        resToJson(Response.WaitList, registration.type, waitListSpot = waitListSpot)
                    )

                    if (sendGridApiKey == null || !sendEmail)
                        return@post

                    sendConfirmationEmail(sendGridApiKey, registration, waitListSpot)
                } else {
                    call.respond(HttpStatusCode.OK, resToJson(Response.OK, registration.type))

                    if (sendGridApiKey == null || !sendEmail)
                        return@post

                    sendConfirmationEmail(sendGridApiKey, registration, null)
                }
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError)
                e.printStackTrace()
            }
        }
    }

    fun Route.deleteRegistration() {
        delete("/$registrationRoute") {
            try {
                val shortReg = call.receive<ShortRegistrationJson>()

                transaction {
                    addLogger(StdOutSqlLogger)

                    Registration.deleteWhere {
                        Registration.happeningSlug eq shortReg.slug and
                            (Registration.email.lowerCase() eq shortReg.email.lowercase())
                    }
                }

                call.respond(
                    HttpStatusCode.OK,
                    "Registration (${shortReg.type}) with email = ${shortReg.email} and slug = ${shortReg.slug} deleted."
                )
            } catch (e: Exception) {
                call.respond(HttpStatusCode.BadRequest, "Error deleting registration.")
                e.printStackTrace()
            }
        }
    }

    fun Route.putHappening(sendGridApiKey: String?, sendEmail: Boolean) {
        put("/$happeningRoute") {
            try {
                val happ = call.receive<HappeningJson>()
                val result = insertOrUpdateHappening(happ, sendEmail, sendGridApiKey)

                call.respond(result.first, result.second)
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, "Error submitting happening.")
                e.printStackTrace()
            }
        }
    }

    fun Route.deleteHappening() {
        delete("/$happeningRoute") {
            try {
                val hap = call.receive<HappeningSlugJson>()

                val hapDeleted = transaction {
                    addLogger(StdOutSqlLogger)

                    val happeningExists = Happening.select { slug eq hap.slug }.firstOrNull() != null
                    if (!happeningExists)
                        return@transaction false

                    SpotRange.deleteWhere {
                        SpotRange.happeningSlug eq hap.slug
                    }

                    Answer.deleteWhere {
                        Answer.happeningSlug eq hap.slug
                    }

                    Registration.deleteWhere {
                        Registration.happeningSlug eq hap.slug
                    }

                    Happening.deleteWhere {
                        slug eq hap.slug
                    }

                    return@transaction true
                }

                if (hapDeleted)
                    call.respond(
                        HttpStatusCode.OK,
                        "${hap.type.toString().lowercase()} with slug = ${hap.slug} deleted."
                    )
                else
                    call.respond(
                        HttpStatusCode.NotFound,
                        "${hap.type.toString().lowercase()} with slug = ${hap.slug} does not exist."
                    )
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, "Error deleting happening.")
                e.printStackTrace()
            }
        }
    }
}
