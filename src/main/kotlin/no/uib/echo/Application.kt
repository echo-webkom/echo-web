package no.uib.echo

import io.ktor.application.*
import io.ktor.server.netty.EngineMain
import no.uib.echo.plugins.configureRouting

fun main(args: Array<String>) {
    EngineMain.main(args)
}

fun Application.module() {
    val dbHost = environment.config.propertyOrNull("ktor.environment")?.getString()
        ?: throw Exception("No DB_HOST specified.")

    Db.init(dbHost)
    configureRouting()
}