package no.uib.echo

import io.ktor.application.*
import io.ktor.server.netty.EngineMain;
import no.uib.echo.plugins.configureRouting

fun main(args: Array<String>): Unit {
    EngineMain.main(args)
}

fun Application.module() {
    configureRouting()
}