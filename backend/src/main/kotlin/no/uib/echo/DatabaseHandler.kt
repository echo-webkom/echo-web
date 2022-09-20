package no.uib.echo

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import no.uib.echo.schema.Answer
import no.uib.echo.schema.Degree
import no.uib.echo.schema.Feedback
import no.uib.echo.schema.HAPPENING_TYPE
import no.uib.echo.schema.Happening
import no.uib.echo.schema.HappeningJson
import no.uib.echo.schema.Registration
import no.uib.echo.schema.SpotRange
import no.uib.echo.schema.SpotRangeJson
import no.uib.echo.schema.StudentGroup
import no.uib.echo.schema.StudentGroupMembership
import no.uib.echo.schema.User
import no.uib.echo.schema.UserJson
import org.flywaydb.core.Flyway
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.batchInsert
import org.jetbrains.exposed.sql.transactions.transaction
import org.joda.time.DateTime
import java.net.URI

private const val DEFAULT_DEV_POOL_SIZE = 10
private const val DEFAULT_PROD_POOL_SIZE = 50

class DatabaseHandler(
    private val dev: Boolean,
    private val testMigration: Boolean,
    dbUrl: URI,
    mbMaxPoolSize: String?
) {
    private val dbPort = if (dbUrl.port == -1) 5432 else dbUrl.port
    private val dbUrl = "jdbc:postgresql://${dbUrl.host}:${dbPort}${dbUrl.path}"
    private val dbUsername = dbUrl.userInfo.split(":")[0]
    private val dbPassword = dbUrl.userInfo.split(":")[1]
    private val maxPoolSize = if (dev) DEFAULT_DEV_POOL_SIZE
    else if (mbMaxPoolSize == null) DEFAULT_PROD_POOL_SIZE
    else mbMaxPoolSize.toIntOrNull() ?: DEFAULT_PROD_POOL_SIZE

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
        if (!dev || testMigration) {
            migrate()
            // Need to use connection once to open.
            transaction(conn) {}
        } else {
            try {
                transaction(conn) {
                    SchemaUtils.create(
                        Happening, Registration, Answer, SpotRange, User, Feedback, StudentGroup, StudentGroupMembership
                    )
                }

                insertTestData()
            } catch (e: Exception) {
                System.err.println("Error creating tables.")
            }
        }
    }

    fun insertTestData() {
        val studentGroups = listOf("webkom", "bedkom", "tilde")
        val users = listOf(
            UserJson(
                "andreas.bakseter@student.uib.no", "halla@bruh.com", 3, Degree.DTEK, listOf("tilde")
            )
        )
        val happenings = listOf(
            HappeningJson(
                "bedriftspresentasjon-med-bekk",
                "Bedpres med Bekk",
                "021-05-06T16:46+01:00",
                "2030-03-09T16:15+01:00",
                spotRanges = listOf(
                    SpotRangeJson(
                        11, 1, 2
                    ),
                    SpotRangeJson(
                        9, 3, 5
                    )
                ),
                HAPPENING_TYPE.BEDPRES,
                "bedkom@echo.uib.no",
                studentGroups[1]
            ),
            HappeningJson(
                "fest-med-tilde",
                "Fest med Tilde!",
                "2021-05-06T16:46+01:00",
                "2030-06-02T14:20+01:00",
                spotRanges = listOf(
                    SpotRangeJson(
                        20, 1, 5
                    )
                ),
                HAPPENING_TYPE.EVENT,
                "tilde@echo.uib.no",
                studentGroups[2]
            )
        )

        try {
            transaction {
                addLogger(StdOutSqlLogger)

                StudentGroup.batchInsert(studentGroups) {
                    this[StudentGroup.name] = it
                }

                User.batchInsert(users) {
                    this[User.email] = it.email
                    this[User.alternateEmail] = it.alternateEmail
                    this[User.degree] = it.degree.toString()
                    this[User.degreeYear] = it.degreeYear
                }

                for (user in users) {
                    StudentGroupMembership.batchInsert(user.memberships) {
                        this[StudentGroupMembership.studentGroupName] = it
                        this[StudentGroupMembership.userEmail] = user.email
                    }
                }

                Happening.batchInsert(happenings) {
                    this[Happening.slug] = it.slug
                    this[Happening.title] = it.title
                    this[Happening.happeningType] = it.type.toString()
                    this[Happening.registrationDate] = DateTime(it.registrationDate)
                    this[Happening.happeningDate] = DateTime(it.happeningDate)
                    this[Happening.organizerEmail] = it.organizerEmail.lowercase()
                    this[Happening.regVerifyToken] = it.slug
                    this[Happening.studentGroupName] = it.studentGroupName.lowercase()
                }

                for (happening in happenings) {
                    SpotRange.batchInsert(happening.spotRanges) {
                        this[SpotRange.happeningSlug] = happening.slug
                        this[SpotRange.spots] = it.spots
                        this[SpotRange.minDegreeYear] = it.minDegreeYear
                        this[SpotRange.maxDegreeYear] = it.maxDegreeYear
                    }
                }
            }
        } catch (e: Exception) {
            System.err.println("Error inserting test data.")
        }
    }
}
