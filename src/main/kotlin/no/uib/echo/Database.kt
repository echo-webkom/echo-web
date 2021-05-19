package no.uib.echo

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import no.uib.echo.schema.Answer
import no.uib.echo.schema.Bedpres
import no.uib.echo.schema.Registration
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import java.net.URI

object Db {
    private fun dataSource(): HikariDataSource {
        if (System.getenv("DEV") != null) {
            val dbHost = System.getenv("DATABASE_HOST") ?: throw Exception("DATABASE_HOST not defined.")

            return HikariDataSource(HikariConfig().apply {
                jdbcUrl = "jdbc:postgresql://$dbHost:5432/postgres"
                username = "postgres"
                password = "password"
                driverClassName = "org.postgresql.Driver"
                connectionTimeout = 1000
                maximumPoolSize = 10
            })
        }

        val dbUri = URI(System.getenv("DATABASE_URL") ?: throw Exception("DATABASE_URL not defined."))

        val dbUrl = "jdbc:postgresql://" + dbUri.host + ':' + dbUri.port + dbUri.path
            .toString() + "?sslmode=require"
        val dbUsername: String = dbUri.userInfo.split(":")[0]
        val dbPassword: String = dbUri.userInfo.split(":")[1]

        return HikariDataSource(HikariConfig().apply {
            jdbcUrl = dbUrl
            username = dbUsername
            password = dbPassword
            driverClassName = "org.postgresql.Driver"
            connectionTimeout = 1000
            maximumPoolSize = 10
        })
    }

    private val conn by lazy {
        Database.connect(dataSource())
    }

    fun init() {
        transaction(conn) {
            SchemaUtils.create(Bedpres, Registration, Answer)
        }
    }
}
