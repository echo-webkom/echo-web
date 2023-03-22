package no.uib.echo.plugins

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import no.uib.echo.Environment
import no.uib.echo.FeatureToggles
import no.uib.echo.routes.*

fun Application.configureRouting(
    featureToggles: FeatureToggles,
    env: Environment,
    sendGridApiKey: String? = null,
    audience: String,
    issuer: String,
    secret: String?,
    jwtConfig: String
) {
    routing { getStatus() }

    registrationRoutes(
        sendEmail = featureToggles.sendEmailReg,
        sendGridApiKey = sendGridApiKey,
        jwtConfig = jwtConfig
    )
    happeningRoutes()
    feedbackRoutes(jwtConfig)
    userRoutes(env, audience, issuer, secret, jwtConfig)
    reactionRoutes(jwtConfig)
    sanityRoutes(env)
    studentGroupRoutes(jwtConfig)
    waitinglistRoutes(jwtConfig, sendGridApiKey)
    strikesRoutes(jwtConfig)
}

fun Route.getStatus() {
    get("/status") { call.respond(HttpStatusCode.OK) }
}
