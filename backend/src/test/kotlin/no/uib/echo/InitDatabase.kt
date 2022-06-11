package no.uib.echo

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.kotest.core.annotation.AutoScan
import io.kotest.core.listeners.BeforeProjectListener
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.transactions.transaction
import java.net.URI

@AutoScan
class InitDatabase : BeforeProjectListener {
    override suspend fun beforeProject() {
        val fullDbUrl = URI(System.getenv("DATABASE_URL"))
        val dbPort = if (fullDbUrl.port == -1) 5432 else fullDbUrl.port
        val dbUrl = "jdbc:postgresql://${fullDbUrl.host}:${dbPort}${fullDbUrl.path}"
        val dbUsername = fullDbUrl.userInfo.split(":")[0]
        val dbPassword = fullDbUrl.userInfo.split(":")[1]

        transaction(
            Database.connect(
                HikariDataSource(
                    HikariConfig().apply {
                        jdbcUrl = dbUrl
                        username = dbUsername
                        password = dbPassword
                        driverClassName = "org.postgresql.Driver"
                        connectionTimeout = 1000
                        maximumPoolSize = 20
                    }
                )
            )
        ) {}
    }
}
