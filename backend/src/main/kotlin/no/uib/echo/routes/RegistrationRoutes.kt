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
import no.uib.echo.schema.FormDeregistrationJson
import no.uib.echo.schema.FormRegistrationJson
import no.uib.echo.schema.HAPPENING_TYPE
import no.uib.echo.schema.Happening
import no.uib.echo.schema.Registration
import no.uib.echo.schema.RegistrationCountJson
import no.uib.echo.schema.RegistrationJson
import no.uib.echo.schema.SlugJson
import no.uib.echo.schema.Status
import no.uib.echo.schema.StudentGroupHappeningRegistration
import no.uib.echo.schema.User
import no.uib.echo.schema.WaitingListUUID
import no.uib.echo.schema.countRegistrationsDegreeYear
import no.uib.echo.schema.getGroupMembers
import no.uib.echo.schema.getUserStudentGroups
import no.uib.echo.schema.nullableStringToDegree
import no.uib.echo.schema.selectSpotRanges
import no.uib.echo.schema.toCsv
import no.uib.echo.sendConfirmationEmail
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
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
import java.util.UUID

fun Application.registrationRoutes(sendGridApiKey: String?, sendEmail: Boolean, jwtConfig: String) {
    routing {
        authenticate(jwtConfig) {
            getRegistrations()
            deleteRegistration()
            getUserIsRegistered()
            postRegistration(sendGridApiKey = sendGridApiKey, sendEmail = sendEmail)
            getUserRegistrations()
        }

        authenticate("auth-admin") {
            postRegistrationCount()
        }
    }
}

fun Route.getRegistrations() {
    get("/registration/{slug}") {
        val email = call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()

        if (email == null) {
            call.respond(HttpStatusCode.Unauthorized)
            return@get
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
            Happening.select { Happening.slug eq slug }.firstOrNull()
        }

        if (hap == null) {
            call.respond(HttpStatusCode.NotFound)
            return@get
        }

        if (email !in getGroupMembers(hap[Happening.studentGroupName])) {
            call.respond(HttpStatusCode.Forbidden)
            return@get
        }

        val regs = transaction {
            Registration.select {
                Registration.happeningSlug eq hap[Happening.slug]
            }.orderBy(Registration.submitDate to SortOrder.ASC).toList().map { reg ->
                val user = transaction {
                    User.select {
                        User.email eq reg[Registration.userEmail].lowercase()
                    }
                }.firstOrNull()

                val answers = transaction {
                    Answer.select {
                        Answer.registrationEmail.lowerCase() eq reg[Registration.userEmail].lowercase() and (Answer.happeningSlug eq hap[Happening.slug])
                    }.orderBy(Answer.id to SortOrder.ASC).toList()
                }.map {
                    AnswerJson(
                        it[Answer.question],
                        it[Answer.answer]
                    )
                }

                RegistrationJson(
                    reg[Registration.userEmail],
                    user?.get(User.alternateEmail),
                    user?.get(User.name) ?: "<ingen navn>",
                    Degree.valueOf(reg[Registration.degree]),
                    reg[Registration.degreeYear],
                    reg[Registration.happeningSlug],
                    reg[Registration.submitDate].toString(),
                    reg[Registration.registrationStatus],
                    reg[Registration.reason],
                    reg[Registration.deregistrationDate].toString(),
                    answers,
                    if (user?.get(User.email) != null) getUserStudentGroups(user[User.email]) else emptyList()
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

fun Route.postRegistration(sendGridApiKey: String?, sendEmail: Boolean) {
    post("/registration") {
        try {
            val email = call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()

            if (email == null) {
                call.respond(HttpStatusCode.Unauthorized, resToJson(RegistrationResponse.NotSignedIn))
                return@post
            }

            val registration = call.receive<FormRegistrationJson>()

            if (email != registration.email) {
                call.respond(HttpStatusCode.BadRequest)
                return@post
            }

            val user = transaction {
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
                call.respond(
                    HttpStatusCode.NonAuthoritativeInformation,
                    resToJson(RegistrationResponse.InvalidDegreeYear)
                )
                return@post
            }

            val happening = transaction {
                Happening.select {
                    Happening.slug eq registration.slug
                }.firstOrNull()
            }

            if (happening == null) {
                call.respond(
                    HttpStatusCode.Conflict,
                    resToJson(RegistrationResponse.HappeningDoesntExist)
                )
                return@post
            }

            val userStudentGroups = getUserStudentGroups(user[User.email])
            val happeningStudentGroups = transaction {
                StudentGroupHappeningRegistration.select {
                    StudentGroupHappeningRegistration.happeningSlug eq happening[Happening.slug]
                }.toList().map { it[StudentGroupHappeningRegistration.studentGroupName] }
            }

            if (happening[Happening.onlyForStudentGroups] && !userStudentGroups.any { happeningStudentGroups.contains(it) }) {
                call.respond(
                    HttpStatusCode.Forbidden,
                    resToJson(RegistrationResponse.OnlyOpenForStudentGroups, studentGroups = happeningStudentGroups)
                )
                return@post
            }

            if (DateTime(happening[Happening.registrationDate]).isAfterNow) {
                if (happening[Happening.studentGroupRegistrationDate] != null && DateTime(happening[Happening.studentGroupRegistrationDate]).isAfterNow) {
                    call.respond(
                        HttpStatusCode.Forbidden,
                        resToJson(
                            RegistrationResponse.TooEarly,
                            regDate = happening[Happening.registrationDate].toString()
                        )
                    )
                    return@post
                }

                if (!userStudentGroups.any { happeningStudentGroups.contains(it) }) {
                    call.respond(
                        HttpStatusCode.Forbidden,
                        resToJson(
                            RegistrationResponse.TooEarly,
                            regDate = happening[Happening.registrationDate].toString()
                        )
                    )
                    return@post
                }
            }

            if (DateTime(happening[Happening.happeningDate]).isBeforeNow) {
                call.respond(
                    HttpStatusCode.Forbidden,
                    resToJson(RegistrationResponse.TooLate)
                )
                return@post
            }

            val spotRanges = selectSpotRanges(registration.slug)

            val canSkipDegreeYearCheck =
                "bedkom" in userStudentGroups && HAPPENING_TYPE.valueOf(happening[Happening.happeningType]) == HAPPENING_TYPE.BEDPRES

            val correctRange = spotRanges.firstOrNull {
                (user[User.degreeYear] in it.minDegreeYear..it.maxDegreeYear) || canSkipDegreeYearCheck
            }

            if (correctRange == null) {
                call.respond(
                    HttpStatusCode.Forbidden,
                    resToJson(RegistrationResponse.NotInRange, spotRanges = spotRanges)
                )
                return@post
            }

            val countRegsInSpotRange = countRegistrationsDegreeYear(
                registration.slug,
                correctRange.minDegreeYear..correctRange.maxDegreeYear,
                Status.REGISTERED
            )
            val countRegsInSpotRangeWaitList = countRegistrationsDegreeYear(
                registration.slug,
                correctRange.minDegreeYear..correctRange.maxDegreeYear,
                Status.WAITLIST
            )

            val totalRegCount = countRegistrationsDegreeYear(registration.slug, 1..5, Status.REGISTERED)
            val totalSpotsCount = spotRanges.sumOf { it.spots }

            val waitList =
                correctRange.spots in 1..countRegsInSpotRange || countRegsInSpotRangeWaitList > 0 || (totalRegCount >= totalSpotsCount && correctRange.spots != 0)
            val waitListSpot = countRegsInSpotRangeWaitList + 1

            val oldReg = transaction {
                Registration.select {
                    Registration.userEmail.lowerCase() eq registration.email.lowercase() and (Registration.happeningSlug eq registration.slug)
                }.firstOrNull()
            }

            if (oldReg != null) {
                if (oldReg[Registration.registrationStatus] != Status.DEREGISTERED) {
                    val responseCode = when (oldReg[Registration.registrationStatus]) {
                        Status.WAITLIST -> RegistrationResponse.AlreadySubmittedWaitList
                        else -> RegistrationResponse.AlreadySubmitted
                    }
                    call.respond(
                        HttpStatusCode.UnprocessableEntity,
                        resToJson(responseCode)
                    )
                    return@post
                }
            }

            if (oldReg != null) {
                transaction {
                    Registration.update({ Registration.userEmail eq registration.email.lowercase() and (Registration.happeningSlug eq registration.slug) }) {
                        it[degree] = userDegree.toString()
                        it[degreeYear] = userDegreeYear
                        it[registrationStatus] = if (waitList) Status.WAITLIST else Status.REGISTERED
                    }
                }
            } else {
                transaction {
                    Registration.insert {
                        it[userEmail] = registration.email.lowercase()
                        it[happeningSlug] = registration.slug
                        it[degree] = userDegree.toString()
                        it[degreeYear] = userDegreeYear
                        it[registrationStatus] = if (waitList) Status.WAITLIST else Status.REGISTERED
                    }
                }
            }

            transaction {
                Answer.deleteWhere { registrationEmail eq registration.email and (happeningSlug eq registration.slug) }

                Answer.batchInsert(registration.answers) { a ->
                    this[Answer.registrationEmail] = registration.email.lowercase()
                    this[Answer.happeningSlug] = registration.slug
                    this[Answer.question] = a.question
                    this[Answer.answer] = a.answer
                }
            }

            if (waitList) {
                transaction {
                    WaitingListUUID.insert {
                        it[uuid] = UUID.randomUUID().toString()
                        it[userEmail] = registration.email.lowercase()
                        it[happeningSlug] = registration.slug
                    }
                }
                call.respond(
                    HttpStatusCode.Accepted,
                    resToJson(RegistrationResponse.WaitList, waitListSpot = waitListSpot.toLong())
                )

                if (sendGridApiKey == null || !sendEmail) {
                    return@post
                }

                sendConfirmationEmail(sendGridApiKey, registration.copy(email = user[User.alternateEmail] ?: user[User.email]), waitListSpot.toLong())
            } else {
                call.respond(HttpStatusCode.OK, resToJson(RegistrationResponse.OK))

                if (sendGridApiKey == null || !sendEmail) {
                    return@post
                }

                sendConfirmationEmail(sendGridApiKey, registration.copy(email = user[User.alternateEmail] ?: user[User.email]), null)
            }
        } catch (e: Exception) {
            call.respond(HttpStatusCode.InternalServerError)
            e.printStackTrace()
        }
    }
}

fun Route.deleteRegistration() {
    delete("/registration") {
        val email = call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()

        if (email == null) {
            call.respond(HttpStatusCode.Unauthorized)
            return@delete
        }

        val toDelete = call.receive<FormDeregistrationJson>()

        val slug = toDelete.slug

        val paramEmail = toDelete.email

        val decodedParamEmail = withContext(Dispatchers.IO) {
            URLDecoder.decode(paramEmail, "utf-8")
        }.lowercase()

        val hap = transaction {
            Happening.select { Happening.slug eq slug }.firstOrNull()
        }

        if (hap == null) {
            call.respond(HttpStatusCode.NotFound)
            return@delete
        }

        if (email !in getGroupMembers(hap[Happening.studentGroupName]) && email != paramEmail) {
            call.respond(HttpStatusCode.Forbidden)
            return@delete
        }

        try {
            val reg = transaction {
                Registration.select {
                    Registration.happeningSlug eq hap[Happening.slug] and (Registration.userEmail.lowerCase() eq decodedParamEmail)
                }.firstOrNull()
            }

            if (reg == null) {
                call.respond(HttpStatusCode.BadRequest, "reg is null")
                return@delete
            }

            val strikes = toDelete.strikes

            transaction {
                Registration.update({ Registration.happeningSlug eq hap[Happening.slug] and (Registration.userEmail.lowerCase() eq decodedParamEmail) }) {
                    it[registrationStatus] = Status.DEREGISTERED
                    it[reason] = toDelete.reason
                    it[deregistrationDate] = DateTime.now()
                }

                if (strikes != null) {
                    User.update({ User.email.lowerCase() eq decodedParamEmail }) {
                        it[User.strikes] = strikes
                    }
                }
            }

            if (reg[Registration.registrationStatus] == Status.WAITLIST) {
                call.respond(
                    HttpStatusCode.OK,
                    "Registration with email = $decodedParamEmail and slug = ${hap[Happening.slug]} was deregistered."
                )
                transaction {
                    WaitingListUUID.deleteWhere {
                        WaitingListUUID.happeningSlug eq hap[Happening.slug] and
                            (WaitingListUUID.userEmail.lowerCase() eq decodedParamEmail)
                    }
                }

                return@delete
            }

            call.respond(
                HttpStatusCode.OK,
                "Registration with email = $decodedParamEmail and slug = ${hap[Happening.slug]} deleted."
            )
            return@delete
        } catch (e: Exception) {
            call.respond(HttpStatusCode.BadRequest, "Error deleting registration.")
            e.printStackTrace()
        }
    }
}

fun Route.getUserIsRegistered() {
    get("/user/registrations/{email}/{slug}") {
        val authEmail = call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()

        if (authEmail == null) {
            call.respond(HttpStatusCode.Unauthorized)
            return@get
        }

        val email = call.parameters["email"]?.lowercase()
        val slug = call.parameters["slug"]
        if (email == null || slug == null) {
            call.respond(HttpStatusCode.BadRequest, "email or slug missing")
            return@get
        }

        if (authEmail != email) {
            call.respond(HttpStatusCode.Forbidden)
            return@get
        }

        val userRegistered = transaction {
            Registration.select { Registration.userEmail eq email and (Registration.happeningSlug eq slug) and (Registration.registrationStatus neq Status.DEREGISTERED) }
                .firstOrNull()
        }
        if (userRegistered == null) {
            call.respond(HttpStatusCode.NotFound)
            return@get
        }

        call.respond(HttpStatusCode.OK)
    }
}

fun Route.postRegistrationCount() {
    post("/registration/count") {
        try {
            val slugs = call.receive<SlugJson>().slugs

            val registrationCounts = transaction {
                slugs.map {
                    val count = countRegistrationsDegreeYear(it, 1..5, Status.REGISTERED)
                    val waitListCount = countRegistrationsDegreeYear(it, 1..5, Status.WAITLIST)

                    RegistrationCountJson(it, count, waitListCount)
                }
            }

            call.respond(
                HttpStatusCode.OK,
                registrationCounts
            )
        } catch (e: Exception) {
            call.respond(HttpStatusCode.InternalServerError, "Error getting registration counts.")
        }
    }
}

fun Route.getUserRegistrations() {
    get("/user/{email}/registrations") {
        val email = call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()

        val userEmail = withContext(Dispatchers.IO) {
            URLDecoder.decode(call.parameters["email"], "UTF-8")
        }
        if (email == null || userEmail == null) {
            call.respond(HttpStatusCode.BadRequest, "NO EMAIL")
            return@get
        }

        if (email != userEmail) {
            call.respond(HttpStatusCode.Forbidden)
            return@get
        }

        val userRegistrations = transaction {
            (Registration leftJoin Happening).select {
                Registration.userEmail eq email
            }.orderBy(Happening.registrationDate to SortOrder.DESC).map {
                it[Happening.slug]
            }.toList()
        }

        call.respond(userRegistrations)
    }
}
