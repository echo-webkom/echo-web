package no.uib.echo.plugins

import io.ktor.routing.*
import io.ktor.application.*
import io.ktor.response.*

fun Application.configureRouting() {
    routing {
        get("/{halloi}") {
            call.parameters["halloi"]?.let { it1 -> call.respondText(it1) }
        }
    }

}
