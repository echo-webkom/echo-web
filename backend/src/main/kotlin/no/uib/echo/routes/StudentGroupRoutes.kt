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
import io.ktor.server.routing.get
import io.ktor.server.routing.put
import io.ktor.server.routing.routing
import kotlinx.serialization.Serializable
import no.uib.echo.schema.StudentGroupMembership
import no.uib.echo.schema.getGroupMembers
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.transactions.transaction

fun Application.studentGroupRoutes() {
    routing { authenticate("auth-jwt") { putMembership() } }
}

fun Route.putMembership() {
    put("/membership") {
        @Serializable
        data class RequestJson(val userEmail: String, val studentGroups: List<String>)

        val req = call.receive<RequestJson>()
        val email =
                call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()

        if (email == null) {
            call.respond(HttpStatusCode.Unauthorized)
            return@put
        }

        if (email !in getGroupMembers("webkom")) {
            call.respond(HttpStatusCode.Forbidden)
            return@put
        }

        transaction {
            addLogger(StdOutSqlLogger)

            StudentGroupMembership.deleteWhere { StudentGroupMembership.userEmail eq req.userEmail }
        }

        transaction {
            addLogger(StdOutSqlLogger)

            req.studentGroups.forEach { group ->
                StudentGroupMembership.insert {
                    it[userEmail] = req.userEmail
                    it[studentGroupName] = group
                }
            }
        }

        call.respond(
                HttpStatusCode.OK,
                "User ${req.userEmail} is now a member of ${req.studentGroups}"
        )
    }
}
