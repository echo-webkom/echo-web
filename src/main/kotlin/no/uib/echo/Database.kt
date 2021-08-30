package no.uib.echo

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import no.uib.echo.schema.Bedpres
import no.uib.echo.schema.BedpresAnswer
import no.uib.echo.schema.BedpresRegistration
import no.uib.echo.schema.Event
import no.uib.echo.schema.EventAnswer
import no.uib.echo.schema.EventRegistration
import org.flywaydb.core.Flyway
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import java.net.URI

object Db {
    val dbUri = URI(System.getenv("DATABASE_URL") ?: throw Exception("DATABASE_URL not defined."))

    val dbPort = if (dbUri.port == -1) 5432 else dbUri.port
    val dbUrl = "jdbc:postgresql://${dbUri.host}:${dbPort}${dbUri.path}"
    val dbUsername = dbUri.userInfo.split(":")[0]
    val dbPassword = dbUri.userInfo.split(":")[1]

    private fun dataSource(): HikariDataSource {
        return HikariDataSource(HikariConfig().apply {
            jdbcUrl = dbUrl
            username = dbUsername
            password = dbPassword
            driverClassName = "org.postgresql.Driver"
            connectionTimeout = 1000
            maximumPoolSize = 10
        })
    }

    private fun migrate() {
        Flyway.configure().baselineOnMigrate(true).dataSource(dbUrl, dbUsername, dbPassword).load().migrate()
    }

    private val conn by lazy {
        Database.connect(dataSource())
    }

    fun init() {
        migrate()
       
        transaction(conn) {
            SchemaUtils.create(Bedpres, Event, BedpresRegistration, EventRegistration, BedpresAnswer, EventAnswer)
        }
    }
}
