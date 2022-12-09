package no.uib.echo.routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.put
import io.ktor.server.routing.routing
import no.uib.echo.schema.StudentGroupMembership
import no.uib.echo.schema._getGroupMembers
import no.uib.echo.schema.getAllUserEmails
import no.uib.echo.schema.getGroupMembers
import no.uib.echo.schema.getUserStudentGroups
import no.uib.echo.schema.validStudentGroups
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.transactions.transaction

fun Application.studentGroupRoutes(jwtConfig: String) {
    routing {
        authenticate(jwtConfig) {
            studentGroup()
        }
    }
}

fun Route.studentGroup() {
    put("/studentgroup") {
        val email = call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()
        if (email !in getGroupMembers("webkom")) {
            call.respond(HttpStatusCode.Unauthorized)
            return@put
        }

        val group = call.request.queryParameters["group"]
        val userEmail = call.request.queryParameters["email"]
        if (group == null || userEmail == null) {
            call.respond(
                HttpStatusCode.BadRequest,
                "Expected values for query parameters 'group' and 'user'. Got 'group'=$group and 'user'=$userEmail"
            )
            return@put
        }

        if (group !in validStudentGroups) {
            call.respond(HttpStatusCode.BadRequest, "Invalid student group: $group")
            return@put
        }

        if (userEmail !in getAllUserEmails()) {
            call.respond(HttpStatusCode.BadRequest, "Invalid user email: $userEmail")
            return@put
        }

        if (userEmail in _getGroupMembers(group)) {
            transaction {
                StudentGroupMembership.deleteWhere {
                    studentGroupName eq group and
                        (StudentGroupMembership.userEmail eq userEmail)
                }
            }
        } else {
            transaction {
                StudentGroupMembership.insert {
                    it[studentGroupName] = group
                    it[StudentGroupMembership.userEmail] = userEmail
                }
            }
        }

        val memberships = getUserStudentGroups(userEmail)
        call.respond(HttpStatusCode.OK, memberships)
    }
}
