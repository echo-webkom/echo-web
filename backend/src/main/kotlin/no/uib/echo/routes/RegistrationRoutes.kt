package no.uib.echo.routes

import io.ktor.http.ContentDisposition
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.request.receive
import io.ktor.server.response.header
import io.ktor.server.response.respond
import io.ktor.server.response.respondBytes
import io.ktor.server.routing.Route
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.routing
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import no.uib.echo.Response
import no.uib.echo.isEmailValid
import no.uib.echo.resToJson
import no.uib.echo.schema.Answer
import no.uib.echo.schema.AnswerJson
import no.uib.echo.schema.Degree
import no.uib.echo.schema.HAPPENING_TYPE
import no.uib.echo.schema.Happening
import no.uib.echo.schema.Registration
import no.uib.echo.schema.RegistrationCountJson
import no.uib.echo.schema.RegistrationJson
import no.uib.echo.schema.SlugJson
import no.uib.echo.schema.bachelors
import no.uib.echo.schema.getGroupMembers
import no.uib.echo.schema.masters
import no.uib.echo.schema.selectSpotRanges
import no.uib.echo.schema.toCsv
import no.uib.echo.sendConfirmationEmail
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import org.joda.time.DateTime
import java.net.URLDecoder

fun Application.registrationRoutes(sendGridApiKey: String?, sendEmail: Boolean, disableJwtAuth: Boolean, verifyRegs: Boolean) {
    routing {
        if (disableJwtAuth) {
            getRegistrations(true)
            deleteRegistration(true)
            getUserIsRegistered(true)
        } else {
            authenticate("auth-jwt") {
                getRegistrations()
                deleteRegistration()
                getUserIsRegistered()
            }
        }

        postRegistration(sendGridApiKey = sendGridApiKey, sendEmail = sendEmail, verifyRegs = verifyRegs)
        postRegistrationCount()
    }
}

fun Route.getRegistrations(disableJwtAuth: Boolean = false) {
    get("/registration/{slug}") {
        var email: String? = null
        if (!disableJwtAuth) {
            email = call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()

            if (email == null) {
                call.respond(HttpStatusCode.Unauthorized)
                return@get
            }
        }

        val slug = call.parameters["slug"]

        if (slug == null) {
            call.respond(HttpStatusCode.BadRequest)
            return@get
        }

        val download = call.request.queryParameters["download"] != null
        val json = call.request.queryParameters["json"] != null
        val testing = call.request.queryParameters["testing"] != null

        val hap = transaction {
            addLogger(StdOutSqlLogger)

            Happening.select { Happening.slug eq slug }.firstOrNull()
        }

        if (hap == null) {
            call.respond(HttpStatusCode.NotFound)
            return@get
        }

        if (!disableJwtAuth) {
            if (email !in getGroupMembers(hap[Happening.studentGroupName])) {
                call.respond(HttpStatusCode.Forbidden)
                return@get
            }
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
                    reg[Registration.happeningSlug],
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
            call.respond(HttpStatusCode.Gone)
        }
    }
}

fun Route.postRegistration(sendGridApiKey: String?, sendEmail: Boolean, verifyRegs: Boolean) {
    post("/registration") {
        try {
            val registration = call.receive<RegistrationJson>()

            // Used for testing only to bypass verifyRegs = false.
            val verifyRegsAnyway = call.request.queryParameters["verify"].toBoolean()

            if (!isEmailValid(registration.email)) {
                call.respond(HttpStatusCode.BadRequest, resToJson(Response.InvalidEmail, registration.type))
                return@post
            }

            if (registration.firstName.isBlank() || registration.lastName.isBlank()) {
                call.respond(HttpStatusCode.BadRequest, resToJson(Response.InvalidName, registration.type))
                return@post
            }

            if (registration.degreeYear !in 1..5) {
                call.respond(HttpStatusCode.BadRequest, resToJson(Response.InvalidDegreeYear, registration.type))
                return@post
            }

            if (registration.degree in bachelors && registration.degreeYear !in 1..3) {
                call.respond(
                    HttpStatusCode.BadRequest,
                    resToJson(Response.DegreeMismatchBachelor, registration.type)
                )
                return@post
            }

            if (registration.degree in masters && registration.degreeYear !in 4..5) {
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

            if (!registration.terms) {
                call.respond(HttpStatusCode.BadRequest, resToJson(Response.InvalidTerms, registration.type))
                return@post
            }

            val happening = transaction {
                addLogger(StdOutSqlLogger)

                Happening.select {
                    Happening.slug eq registration.slug
                }.firstOrNull()
            }

            if (happening == null) {
                call.respond(
                    HttpStatusCode.Conflict,
                    resToJson(Response.HappeningDoesntExist, registration.type)
                )
                return@post
            }

            if (happening[Happening.regVerifyToken] != registration.regVerifyToken && (verifyRegs || verifyRegsAnyway)) {
                call.respond(HttpStatusCode.Unauthorized, resToJson(Response.NotViaForm, registration.type))
                return@post
            }

            if (DateTime(happening[Happening.registrationDate]).isAfterNow) {
                call.respond(
                    HttpStatusCode.Forbidden,
                    resToJson(
                        Response.TooEarly,
                        registration.type,
                        regDate = happening[Happening.registrationDate].toString()
                    )
                )
                return@post
            }

            if (DateTime(happening[Happening.happeningDate]).isBeforeNow) {
                call.respond(
                    HttpStatusCode.Forbidden,
                    resToJson(Response.TooLate, registration.type)
                )
                return@post
            }

            val spotRanges = selectSpotRanges(registration.slug)

            val correctRange = spotRanges.firstOrNull {
                registration.degreeYear in it.minDegreeYear..it.maxDegreeYear
            }

            if (correctRange == null) {
                call.respond(
                    HttpStatusCode.Forbidden,
                    resToJson(Response.NotInRange, registration.type, spotRanges = spotRanges)
                )
                return@post
            }

            val countRegsInSpotRange = transaction {
                addLogger(StdOutSqlLogger)

                Registration.select {
                    Registration.happeningSlug eq registration.slug and
                        (Registration.degreeYear inList correctRange.minDegreeYear..correctRange.maxDegreeYear)
                }.count()
            }

            val spotRangeOnWaitList = transaction {
                addLogger(StdOutSqlLogger)

                Registration.select {
                    Registration.happeningSlug eq registration.slug and
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
                    it[terms] = true
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

                if (sendGridApiKey == null || !sendEmail) {
                    return@post
                }

                sendConfirmationEmail(sendGridApiKey, registration, waitListSpot)
            } else {
                call.respond(HttpStatusCode.OK, resToJson(Response.OK, registration.type))

                if (sendGridApiKey == null || !sendEmail) {
                    return@post
                }

                sendConfirmationEmail(sendGridApiKey, registration, null)
            }
        } catch (e: Exception) {
            call.respond(HttpStatusCode.InternalServerError)
            e.printStackTrace()
        }
    }
}

fun Route.deleteRegistration(disableJwtAuth: Boolean = false) {
    delete("/registration/{slug}/{email}") {
        var email: String? = null
        if (!disableJwtAuth) {
            email = call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()

            if (email == null) {
                call.respond(HttpStatusCode.Unauthorized)
                return@delete
            }
        }

        val slug = call.parameters["slug"]

        if (slug == null) {
            call.respond(HttpStatusCode.BadRequest)
            return@delete
        }

        val paramEmail = call.parameters["email"]

        if (paramEmail == null) {
            call.respond(HttpStatusCode.BadRequest)
            return@delete
        }

        val decodedParamEmail = withContext(Dispatchers.IO) {
            URLDecoder.decode(paramEmail, "utf-8")
        }.lowercase()

        val hap = transaction {
            addLogger(StdOutSqlLogger)

            Happening.select { Happening.slug eq slug }.firstOrNull()
        }

        if (hap == null) {
            call.respond(HttpStatusCode.NotFound)
            return@delete
        }

        if (!disableJwtAuth) {
            if (email !in getGroupMembers(hap[Happening.studentGroupName])) {
                call.respond(HttpStatusCode.Forbidden)
                return@delete
            }
        }

        try {
            val reg = transaction {
                addLogger(StdOutSqlLogger)

                Registration.select {
                    Registration.happeningSlug eq hap[Happening.slug] and
                        (Registration.email.lowerCase() eq decodedParamEmail)
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
                        (Answer.registrationEmail.lowerCase() eq decodedParamEmail)
                }

                Registration.deleteWhere {
                    Registration.happeningSlug eq hap[Happening.slug] and
                        (Registration.email.lowerCase() eq decodedParamEmail)
                }
            }

            if (reg[Registration.waitList]) {
                call.respond(
                    HttpStatusCode.OK,
                    "Registration with email = $decodedParamEmail and slug = ${hap[Happening.slug]} deleted."
                )
                return@delete
            }

            val highestOnWaitList = transaction {
                addLogger(StdOutSqlLogger)

                Registration.select {
                    Registration.waitList eq true and
                        (Registration.happeningSlug eq hap[Happening.slug])
                }.orderBy(Registration.submitDate).firstOrNull()
            }

            if (highestOnWaitList == null) {
                call.respond(
                    HttpStatusCode.OK,
                    "Registration with email = $decodedParamEmail and slug = ${hap[Happening.slug]} deleted."
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
                    "Registration with email = $decodedParamEmail and slug = ${hap[Happening.slug]} deleted, " +
                        "and registration with email = ${highestOnWaitList[Registration.email].lowercase()} moved off wait list."
                )
            }
        } catch (e: Exception) {
            call.respond(HttpStatusCode.BadRequest, "Error deleting registration.")
            e.printStackTrace()
        }
    }
}

fun Route.getUserIsRegistered(disableJwtAuth: Boolean = false){
    get("user/registrations/{email?}/{slug?}") {
        val email = call.parameters["email"]?.lowercase()
        val slug = call.parameters["slug"]
        if (email == null || slug == null){
            call.respond(HttpStatusCode.BadRequest, "email or slug missing")
            return@get
        }

        val userRegistered = transaction {
            Registration.select(Registration.email eq email and(Happening.slug eq slug)).firstOrNull()
        }
        if (userRegistered == null){
            call.respond(HttpStatusCode.OK, false)
            return@get
        } else {
            call.respond(HttpStatusCode.OK, true)
            return@get
        }
    }
}


fun Route.postRegistrationCount() {
    post("/registration/count") {
        val slugs = call.receive<SlugJson>().slugs
        val registrationCounts = transaction {
            addLogger(StdOutSqlLogger)

            slugs.map {
                val count = Registration.select {
                    Registration.happeningSlug eq it
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
    }
}
