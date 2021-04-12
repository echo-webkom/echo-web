package no.uib.echo

import io.ktor.server.engine.*
import io.ktor.server.netty.*
import no.uib.echo.plugins.*

fun main() {
    embeddedServer(Netty, port = 80, host = "0.0.0.0") {
        configureRouting()
    }.start(wait = true)
}
