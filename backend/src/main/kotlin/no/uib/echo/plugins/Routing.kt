package no.uib.echo.plugins

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import no.uib.echo.FeatureToggles
import no.uib.echo.routes.feedbackRoutes
import no.uib.echo.routes.happeningRoutes
import no.uib.echo.routes.reactionRoutes
import no.uib.echo.routes.registrationRoutes
import no.uib.echo.routes.sanityRoutes
import no.uib.echo.routes.studentGroupRoutes
import no.uib.echo.routes.userRoutes

fun Application.configureRouting(
    featureToggles: FeatureToggles,
    dev: Boolean = false,
    disableJwtAuth: Boolean = false,
    sendGridApiKey: String? = null
) {
    routing {
        getStatus()
    }

    registrationRoutes(
        disableJwtAuth = disableJwtAuth,
        sendEmail = featureToggles.sendEmailReg,
        sendGridApiKey = sendGridApiKey,
        verifyRegs = featureToggles.sendEmailReg
    )
    happeningRoutes()
    feedbackRoutes()
    userRoutes()
    reactionRoutes()
    sanityRoutes(dev)
    studentGroupRoutes()
}

fun Route.getStatus() {
    get("/status") {
        call.respond(HttpStatusCode.OK)
    }
}
