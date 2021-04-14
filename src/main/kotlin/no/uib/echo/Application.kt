package no.uib.echo

import io.ktor.application.*
import io.ktor.server.netty.EngineMain;
import no.uib.echo.plugins.configureRouting
import no.uib.echo.types.Bedpres
import no.uib.echo.types.Registration
import no.uib.echo.types.Student
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction

fun main(args: Array<String>): Unit {
    Database.connect("jdbc:postgresql://0.0.0.0:5432/postgres", driver = "org.postgresql.Driver", user = "postgres", password = "password")

    transaction {
        SchemaUtils.create(Bedpres, Registration, Student)
    }

    EngineMain.main(args)
}

fun Application.module() {
    configureRouting()
}