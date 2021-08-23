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
        val dbUri = URI(System.getenv("DATABASE_URL") ?: throw Exception("DATABASE_URL not defined."))
        val port = if (dbUri.port == -1) 5432 else dbUri.port

        return HikariDataSource(HikariConfig().apply {
            jdbcUrl = "jdbc:postgresql://${dbUri.host}:${port}${dbUri.path}"
            username = dbUri.userInfo.split(":")[0]
            password = dbUri.userInfo.split(":")[1]
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
