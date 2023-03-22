package no.uib.echo.routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.routing
import no.uib.echo.schema.Happening
import no.uib.echo.schema.Registration
import no.uib.echo.schema.Status
import no.uib.echo.schema.WaitingListUUID
import no.uib.echo.schema.WaitingListUUID.happeningSlug
import no.uib.echo.schema.WaitingListUUID.userEmail
import no.uib.echo.schema.getGroupMembers
import no.uib.echo.schema.isPersonLegalToPromote
import no.uib.echo.schema.isPromotionLegal
import no.uib.echo.schema.notifyWaitinglistPerson
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update

fun Application.waitinglistRoutes(jwtConfig: String, sendGridApiKey: String?) {
    routing {
        if (sendGridApiKey != null) {
            authenticate(jwtConfig) {
                promoteFromWaitingList(sendGridApiKey)
            }
        }
        promoteFromWaitingListWithoutValidation()
    }
}

fun Route.promoteFromWaitingListWithoutValidation() {
    post("/registration/promote/{UUID}") {
        try {
            val uuid = call.parameters["UUID"]
            if (uuid == null) {
                call.respond(HttpStatusCode.BadRequest, "the uuid was null")
                return@post
            }

            val waitingListResult = transaction {
                WaitingListUUID.select {
                    WaitingListUUID.uuid eq uuid
                }.firstOrNull()
            }
            if (waitingListResult == null) {
                call.respond(HttpStatusCode.BadRequest, "the UUID '$uuid' was not found in the database")
                return@post
            }

            val happeningSlug = waitingListResult[happeningSlug]
            val email = waitingListResult[userEmail]

            if (!isPromotionLegal(happeningSlug) || !isPersonLegalToPromote(happeningSlug, email)) {
                call.respond(HttpStatusCode.Accepted, "user ($email) was denied promotion from the waiting list, person or promotion was illegal")
                return@post
            }

            transaction {
                Registration.update({
                    Registration.happeningSlug eq waitingListResult[WaitingListUUID.happeningSlug] and
                        (Registration.userEmail eq waitingListResult[WaitingListUUID.userEmail])
                }) {
                    it[registrationStatus] = Status.REGISTERED
                }

                WaitingListUUID.deleteWhere { WaitingListUUID.uuid eq uuid }
            }
            call.respond(HttpStatusCode.OK, "user ($email) was promoted from the waiting list")
        } catch (e: Exception) {
            call.respond(HttpStatusCode.InternalServerError)
            e.printStackTrace()
        }
    }
}

fun Route.promoteFromWaitingList(sendGridApiKey: String) {
    get("/registration/promote/can_promote/{slug}") {
        val happeningSlug = call.parameters["slug"]
        if (happeningSlug == null) {
            call.respond(HttpStatusCode.NotFound, "Slug was null")
            return@get
        }

        val slug = transaction {
            Happening.select {
                Happening.slug eq happeningSlug
            }.firstOrNull()
        }
        if (slug == null) {
            call.respond(HttpStatusCode.NotFound, "could not find event")
            return@get
        }
        val canPromote = isPromotionLegal(slug[Happening.slug])

        if (canPromote) {
            call.respond(HttpStatusCode.OK)
            return@get
        } else {
            call.respond(HttpStatusCode.Forbidden, "Promotion for ${slug[Happening.slug]} was not allowed")
            return@get
        }
    }

    post("/registration/promote/email/{slug}/{email}") {
        try {
            val adminEmail = call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()
            val happeningSlug = call.parameters["slug"]
            val email = call.parameters["email"]

            if (happeningSlug == null || email == null) {
                call.respond(HttpStatusCode.NotFound, "Slug or email was null")
                return@post
            }

            val slug = transaction {
                Happening.select {
                    Happening.slug eq happeningSlug
                }.firstOrNull()
            }

            if (slug == null) {
                call.respond(HttpStatusCode.NotFound, "could not find event")
                return@post
            }

            if (adminEmail !in getGroupMembers(slug[Happening.studentGroupName])) {
                call.respond(HttpStatusCode.Forbidden)
                return@post
            }

            if (!isPersonLegalToPromote(happeningSlug, email)) {
                call.respond(HttpStatusCode.Forbidden, "promotion from the waiting list was denied")
                return@post
            }

            val notifiedSuccess = notifyWaitinglistPerson(happeningSlug, email, sendGridApiKey)
            if (!notifiedSuccess) {
                call.respond(HttpStatusCode.InternalServerError, "could not send email")
                return@post
            }
            call.respond(HttpStatusCode.OK)
        } catch (e: Exception) {
            call.respond(HttpStatusCode.InternalServerError)
            e.printStackTrace()
        }
    }

    post("/registration/promote/noemail/{slug}/{email}") {
        try {
            val adminEmail = call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()

            val happeningSlug = call.parameters["slug"]
            val email = call.parameters["email"]

            if (happeningSlug == null || email == null) {
                call.respond(HttpStatusCode.NotFound, "Slug or email was null")
                return@post
            }

            val slug = transaction {
                Happening.select {
                    Happening.slug eq happeningSlug
                }.firstOrNull()
            }

            if (slug == null) {
                call.respond(HttpStatusCode.NotFound, "Slug was not found in database")
                return@post
            }

            if (adminEmail !in getGroupMembers(slug[Happening.studentGroupName])) {
                call.respond(HttpStatusCode.Forbidden)
                return@post
            }

            val reg = transaction {
                Registration.select {
                    Registration.happeningSlug eq happeningSlug and(
                        Registration.userEmail eq email
                        )
                }.firstOrNull()
            }

            if (reg == null) {
                call.respond(HttpStatusCode.NotFound, "the email was not registered to the slug")
                return@post
            }

            if (!isPromotionLegal(happeningSlug) || !isPersonLegalToPromote(happeningSlug, email)) {
                call.respond(HttpStatusCode.Forbidden, "promotion from the waiting list was denied")
                return@post
            }

            transaction {
                Registration.update({
                    Registration.happeningSlug eq happeningSlug and
                        (Registration.userEmail eq email)
                }) {
                    it[registrationStatus] = Status.REGISTERED
                }
                WaitingListUUID.deleteWhere { WaitingListUUID.uuid eq uuid }
            }
            call.respond(HttpStatusCode.OK)
        } catch (e: Exception) {
            call.respond(HttpStatusCode.InternalServerError)
            e.printStackTrace()
        }
    }
}
