package no.uib.echo.plugins

import io.ktor.routing.*
import io.ktor.http.*
import io.ktor.application.*
import io.ktor.response.*
import io.ktor.request.*

fun Application.configureRouting() {
    // Starting point for a Ktor app:
    routing {
        get("/{halloi}") {
            call.parameters["halloi"]?.let { it1 -> call.respondText(it1) }
        }
    }

}
