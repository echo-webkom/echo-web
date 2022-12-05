package no.uib.echo.routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.post
import io.ktor.server.routing.routing
import no.uib.echo.schema.Registration
import no.uib.echo.schema.WaitingListUUID
import no.uib.echo.schema.WaitingListUUID.happeningSlug
import no.uib.echo.schema.WaitingListUUID.userEmail
import no.uib.echo.schema.isPersonLegalToPromote
import no.uib.echo.schema.isPromotionLegal
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update

fun Application.waitinglistRoutes() {
    routing {
        promoteFromWaitingList()
    }
}

fun Route.promoteFromWaitingList() {
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
                call.respond(HttpStatusCode.Forbidden, "promotion from the waiting list was denied")
                return@post
            }

            transaction {
                Registration.update({
                    Registration.happeningSlug eq waitingListResult[WaitingListUUID.happeningSlug] and
                        (Registration.userEmail eq waitingListResult[WaitingListUUID.userEmail])
                }) {
                    it[waitList] = false
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
