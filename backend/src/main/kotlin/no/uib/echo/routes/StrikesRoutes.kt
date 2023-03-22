package no.uib.echo.routes

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import no.uib.echo.Environment
import no.uib.echo.schema.Strikes
import no.uib.echo.schema.StrikesJson
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction

fun Application.strikesRoutes(
    jwtConfig: String
) {
    routing {
        authenticate(jwtConfig) {
            getAllStrikes()
            getStrikesCount()
        }
        postStrikes()
    }
}

fun Route.getAllStrikes() {
    get("/strikes") {
        val strikes = transaction {
            Strikes.selectAll().toList()
        }
        call.respond(HttpStatusCode.OK, strikes)
    }
}

fun Route.getStrikesCount() {
    get("/strikes/{email}") {
        val email =
            call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()

        if (email == null) {
            call.respond(HttpStatusCode.Unauthorized)
            return@get
        }

        val strikes = transaction {
            Strikes.select { Strikes.userEmail eq email }.count()
        }

        call.respond(HttpStatusCode.OK, strikes)
    }
}

fun Route.postStrikes() {
    post("/strikes") {
        try {
            val email = call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()
            val strikes = call.receive<StrikesJson>()

            if (email == null) {
                call.respond(HttpStatusCode.Unauthorized)
                return@post
            }
            transaction {
                Strikes.insert {
                    it[userEmail] = email
                    it[reason] = strikes.reason
                }
            }
            call.respond(HttpStatusCode.OK)

        } catch (e: Exception) {
            call.respond(HttpStatusCode.InternalServerError)
            e.printStackTrace()
            return@post
        }
    }
}

