package no.uib.echo

import io.ktor.application.*
import io.ktor.server.netty.EngineMain
import no.uib.echo.plugins.configureRouting
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction

fun main(args: Array<String>) {
    EngineMain.main(args)

    transaction(Database.connect(DatabaseConn.pool())) {
        SchemaUtils.create(Bedpres, Registration, Student)
    }
}

fun Application.module() {
    configureRouting()
}