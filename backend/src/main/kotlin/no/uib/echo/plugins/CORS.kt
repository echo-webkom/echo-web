package no.uib.echo.plugins

import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.cors.routing.CORS
import no.uib.echo.Environment

fun Application.configureCORS(env: Environment) {
    install(CORS) {
        if (env === Environment.PRODUCTION) {
            allowHost("echo.uib.no", schemes = listOf("https"))
        } else {
            allowHost("localhost:3000", schemes = listOf("http"))
            allowHost("*.vercel.app", schemes = listOf("https"))
        }

        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Delete)

        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
    }
}
