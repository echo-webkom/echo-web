package no.uib.echo.routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.put
import io.ktor.server.routing.routing
import kotlinx.serialization.Serializable
import no.uib.echo.schema.Feedback
import no.uib.echo.schema.FeedbackJson
import no.uib.echo.schema.FeedbackResponse
import no.uib.echo.schema.FeedbackResponseJson
import no.uib.echo.schema.getGroupMembers
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update

fun Application.feedbackRoutes(jwtConfig: String) {
    routing {
        authenticate(jwtConfig) {
            getFeedback()
            putFeedback()
            deleteFeedback()
        }

        postFeedback()
    }
}

fun Route.postFeedback() {
    post("/feedback") {
        try {
            val feedback = call.receive<FeedbackJson>()

            if (feedback.message.isEmpty()) {
                call.respond(HttpStatusCode.BadRequest, FeedbackResponse.EMPTY)
                return@post
            }

            transaction {
                Feedback.insert {
                    it[email] = feedback.email
                    it[name] = feedback.name
                    it[message] = feedback.message
                }
            }

            call.respond(HttpStatusCode.OK, FeedbackResponse.SUCCESS)
        } catch (e: Exception) {
            call.respond(HttpStatusCode.InternalServerError, "Error deleting feedback.")
            e.printStackTrace()
        }
    }
}

fun Route.getFeedback() {
    get("/feedback") {
        val email = call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()

        if (email == null) {
            call.respond(HttpStatusCode.Unauthorized)
            return@get
        }

        if (email !in getGroupMembers("webkom")) {
            call.respond(HttpStatusCode.Forbidden)
            return@get
        }

        val feedback =
            transaction {
                Feedback.selectAll().map {
                    FeedbackResponseJson(
                        it[Feedback.id],
                        it[Feedback.email],
                        it[Feedback.name],
                        it[Feedback.message],
                        it[Feedback.sentAt].toString(),
                        it[Feedback.isRead],
                    )
                }
            }

        call.respond(HttpStatusCode.OK, feedback)
    }
}

fun Route.deleteFeedback() {
    delete("/feedback") {
        @Serializable
        data class ReqJson(val id: Int)

        val email = call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()

        if (email == null) {
            call.respond(HttpStatusCode.Unauthorized)
            return@delete
        }

        if (email !in getGroupMembers("webkom")) {
            call.respond(HttpStatusCode.Forbidden)
            return@delete
        }

        try {
            val req = call.receive<ReqJson>()

            transaction {
                Feedback.deleteWhere {
                    Feedback.id eq req.id
                }
            }

            call.respond(HttpStatusCode.OK, FeedbackResponse.SUCCESS)
        } catch (e: Exception) {
            call.respond(HttpStatusCode.InternalServerError, "Error deleting feedback.")
            e.printStackTrace()
        }
    }
}

fun Route.putFeedback() {
    put("/feedback") {
        try {
            val email = call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()

            if (email !in getGroupMembers("webkom")) {
                call.respond(HttpStatusCode.Forbidden)
                return@put
            }

            val feedback = call.receive<FeedbackResponseJson>()

            transaction {
                Feedback.update({ Feedback.id eq feedback.id }) {
                    it[Feedback.email] = feedback.email
                    it[name] = feedback.name
                    it[message] = feedback.message
                    it[isRead] = feedback.isRead
                }
            }

            call.respond(HttpStatusCode.OK, FeedbackResponse.SUCCESS)
        } catch (e: Exception) {
            call.respond(HttpStatusCode.InternalServerError, "Error putting feedback.")
            e.printStackTrace()
        }
    }
}
