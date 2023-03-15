package no.uib.echo.routes

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import no.uib.echo.Environment
import no.uib.echo.schema.Strikes
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction

fun Application.strikesRoutes(
    env: Environment,
    audience: String,
    issuer: String,
    secret: String?,
    jwtConfig: String
) {
    routing {
        getToken(env, audience, issuer, secret)
        authenticate(jwtConfig) {
            getStrikesCount()
        }
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

