package no.uib.echo

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import no.uib.echo.schema.Answer
import no.uib.echo.schema.Happening
import no.uib.echo.schema.Registration
import no.uib.echo.schema.SpotRange
import org.flywaydb.core.Flyway
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import java.net.URI

object DatabaseHandler {
    private val dbUri = URI(System.getenv("DATABASE_URL") ?: throw Exception("DATABASE_URL not defined."))
    private val dev = System.getenv("DEV") != null
    private val maxPoolSize = if (dev) 10 else System.getenv("MAX_POOL_SIZE").toIntOrNull() ?: 50

    private val dbPort = if (dbUri.port == -1) 5432 else dbUri.port
    private val dbUrl = "jdbc:postgresql://${dbUri.host}:${dbPort}${dbUri.path}"
    private val dbUsername = dbUri.userInfo.split(":")[0]
    private val dbPassword = dbUri.userInfo.split(":")[1]

    private fun dataSource(): HikariDataSource {
        return HikariDataSource(
            HikariConfig().apply {
                jdbcUrl = dbUrl
                username = dbUsername
                password = dbPassword
                driverClassName = "org.postgresql.Driver"
                connectionTimeout = 1000
                maximumPoolSize = maxPoolSize
            }
        )
    }

    private fun migrate() {
        Flyway.configure().baselineOnMigrate(true).dataSource(dbUrl, dbUsername, dbPassword).load().migrate()
    }

    private val conn by lazy {
        Database.connect(dataSource())
    }

    fun init() {
        // Don't migrate if running on local machine
        if (!dev) {
            migrate()
            // Need to use connection once to open.
            transaction(conn) {}
        } else {
            try {
                transaction(conn) {
                    SchemaUtils.create(
                        Happening,
                        Registration,
                        Answer,
                        SpotRange
                    )
                }
            } catch (e: Exception) {
                println("Assuming all tables already exists, and continuing anyway.")
            }
        }
    }
}
