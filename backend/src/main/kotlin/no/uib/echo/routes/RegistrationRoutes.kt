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
import no.uib.echo.RegistrationResponse
import no.uib.echo.resToJson
import no.uib.echo.schema.Answer
import no.uib.echo.schema.AnswerJson
import no.uib.echo.schema.Degree
import no.uib.echo.schema.FormRegistrationJson
import no.uib.echo.schema.Happening
import no.uib.echo.schema.Registration
import no.uib.echo.schema.RegistrationCountJson
import no.uib.echo.schema.RegistrationJson
import no.uib.echo.schema.SlugJson
import no.uib.echo.schema.User
import no.uib.echo.schema.countRegistrationsDegreeYear
import no.uib.echo.schema.getGroupMembers
import no.uib.echo.schema.selectSpotRanges
import no.uib.echo.schema.toCsv
import no.uib.echo.sendConfirmationEmail
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
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
import java.net.URLDecoder
import no.uib.echo.schema.nullableStringToDegree

fun Application.registrationRoutes(sendGridApiKey: String?, sendEmail: Boolean, disableJwtAuth: Boolean) {
    routing {
        if (disableJwtAuth) {
            getRegistrations(true)
            deleteRegistration(true)
            postRegistration(sendGridApiKey = sendGridApiKey, sendEmail = sendEmail, disableJwtAuth = true)
        } else {
            authenticate("auth-jwt") {
                getRegistrations()
                deleteRegistration()
                postRegistration(sendGridApiKey = sendGridApiKey, sendEmail = sendEmail)
            }
        }

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
                val user = transaction {
                    User.select {
                        User.email eq reg[Registration.userEmail].lowercase()
                    }
                }.firstOrNull()

                RegistrationJson(
                    user?.get(User.alternateEmail) ?: reg[Registration.userEmail],
                    user?.get(User.name) ?: "<ingen navn>",
                    Degree.valueOf(reg[Registration.degree]),
                    reg[Registration.degreeYear],
                    reg[Registration.happeningSlug],
                    reg[Registration.submitDate].toString(),
                    reg[Registration.waitList],
                    transaction {
                        addLogger(StdOutSqlLogger)

                        Answer.select {
                            Answer.registrationEmail.lowerCase() eq reg[Registration.userEmail].lowercase() and (Answer.happeningSlug eq hap[Happening.slug])
                        }.toList()
                    }.map {
                        AnswerJson(
                            it[Answer.question], it[Answer.answer]
                        )
                    },
                )
            }
        }

        if (download) {
            val fileName = "pameldte-${hap[Happening.slug]}.csv"

            call.response.header(
                HttpHeaders.ContentDisposition,
                ContentDisposition.Attachment.withParameter(
                    ContentDisposition.Parameters.FileName, fileName
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

fun Route.postRegistration(sendGridApiKey: String?, sendEmail: Boolean, disableJwtAuth: Boolean = false) {
    post("/registration") {
        try {
            var email: String? = null
            if (!disableJwtAuth) {
                email = call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()

                if (email == null) {
                    call.respond(HttpStatusCode.Unauthorized)
                    return@post
                }
            }

            val registration = call.receive<FormRegistrationJson>()

            if (!disableJwtAuth && email != registration.email) {
                call.respond(HttpStatusCode.BadRequest)
                return@post
            }

            val user = transaction {
                addLogger(StdOutSqlLogger)

                User.select {
                    User.email.lowerCase() eq registration.email.lowercase()
                }.firstOrNull()
            }

            if (user == null) {
                call.respond(HttpStatusCode.Unauthorized, resToJson(RegistrationResponse.NotSignedIn))
                return@post
            }

            val userDegree = nullableStringToDegree(user[User.degree])
            val userDegreeYear = user[User.degreeYear]

            if (userDegree == null) {
                call.respond(HttpStatusCode.MultipleChoices, resToJson(RegistrationResponse.InvalidDegree))
                return@post
            }

            if (userDegreeYear == null || userDegreeYear !in 1..5) {
                call.respond(HttpStatusCode.NonAuthoritativeInformation, resToJson(RegistrationResponse.InvalidDegreeYear))
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
                    HttpStatusCode.Conflict, resToJson(RegistrationResponse.HappeningDoesntExist)
                )
                return@post
            }

            if (DateTime(happening[Happening.registrationDate]).isAfterNow) {
                call.respond(
                    HttpStatusCode.Forbidden,
                    resToJson(
                        RegistrationResponse.TooEarly, regDate = happening[Happening.registrationDate].toString()
                    )
                )
                return@post
            }

            if (DateTime(happening[Happening.happeningDate]).isBeforeNow) {
                call.respond(
                    HttpStatusCode.Forbidden, resToJson(RegistrationResponse.TooLate)
                )
                return@post
            }

            val spotRanges = selectSpotRanges(registration.slug)

            val correctRange = spotRanges.firstOrNull {
                user[User.degreeYear] in it.minDegreeYear..it.maxDegreeYear
            }

            if (correctRange == null) {
                call.respond(
                    HttpStatusCode.Forbidden, resToJson(RegistrationResponse.NotInRange, spotRanges = spotRanges)
                )
                return@post
            }

            val countRegsInSpotRange = countRegistrationsDegreeYear(
                registration.slug, correctRange.minDegreeYear..correctRange.maxDegreeYear, false
            )
            val countRegsInSpotRangeWaitList = countRegistrationsDegreeYear(
                registration.slug, correctRange.minDegreeYear..correctRange.maxDegreeYear, true
            )

            val waitList = correctRange.spots in 1..countRegsInSpotRange || countRegsInSpotRangeWaitList > 0
            val waitListSpot = countRegsInSpotRangeWaitList + 1

            val oldReg = transaction {
                addLogger(StdOutSqlLogger)

                Registration.select {
                    Registration.userEmail.lowerCase() eq registration.email.lowercase() and (Registration.happeningSlug eq registration.slug)
                }.firstOrNull()
            }

            if (oldReg != null) {
                val responseCode = when (oldReg[Registration.waitList]) {
                    true -> RegistrationResponse.AlreadySubmittedWaitList
                    false -> RegistrationResponse.AlreadySubmitted
                }
                call.respond(
                    HttpStatusCode.UnprocessableEntity, resToJson(responseCode)
                )
                return@post
            }

            transaction {
                addLogger(StdOutSqlLogger)

                Registration.insert {
                    it[userEmail] = registration.email.lowercase()
                    it[happeningSlug] = registration.slug
                    it[degree] = userDegree.toString()
                    it[degreeYear] = userDegreeYear
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
                    resToJson(RegistrationResponse.WaitList, waitListSpot = waitListSpot.toLong())
                )

                if (sendGridApiKey == null || !sendEmail) {
                    return@post
                }

                sendConfirmationEmail(sendGridApiKey, registration, waitListSpot.toLong())
            } else {
                call.respond(HttpStatusCode.OK, resToJson(RegistrationResponse.OK))

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
                    Registration.happeningSlug eq hap[Happening.slug] and (Registration.userEmail.lowerCase() eq decodedParamEmail)
                }.firstOrNull()
            }

            if (reg == null) {
                call.respond(HttpStatusCode.BadRequest)
                return@delete
            }

            transaction {
                addLogger(StdOutSqlLogger)

                Answer.deleteWhere {
                    Answer.happeningSlug eq hap[Happening.slug] and (Answer.registrationEmail.lowerCase() eq decodedParamEmail)
                }

                Registration.deleteWhere {
                    Registration.happeningSlug eq hap[Happening.slug] and (Registration.userEmail.lowerCase() eq decodedParamEmail)
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
                    Registration.waitList eq true and (Registration.happeningSlug eq hap[Happening.slug])
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

                    Registration.update({ Registration.userEmail eq highestOnWaitList[Registration.userEmail].lowercase() and (Registration.happeningSlug eq hap[Happening.slug]) }) {
                        it[waitList] = false
                    }
                }
                call.respond(
                    HttpStatusCode.OK,
                    "Registration with email = $decodedParamEmail and slug = ${hap[Happening.slug]} deleted, " + "and registration with email = ${highestOnWaitList[Registration.userEmail].lowercase()} moved off wait list."
                )
            }
        } catch (e: Exception) {
            call.respond(HttpStatusCode.BadRequest, "Error deleting registration.")
            e.printStackTrace()
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
            HttpStatusCode.OK, registrationCounts
        )
    }
}
