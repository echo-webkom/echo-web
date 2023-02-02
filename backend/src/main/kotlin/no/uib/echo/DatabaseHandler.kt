package no.uib.echo

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import no.uib.echo.schema.Answer
import no.uib.echo.schema.Feedback
import no.uib.echo.schema.HAPPENING_TYPE
import no.uib.echo.schema.Happening
import no.uib.echo.schema.HappeningJson
import no.uib.echo.schema.Reaction
import no.uib.echo.schema.Registration
import no.uib.echo.schema.SpotRange
import no.uib.echo.schema.SpotRangeJson
import no.uib.echo.schema.StudentGroup
import no.uib.echo.schema.StudentGroupHappeningRegistration
import no.uib.echo.schema.StudentGroupMembership
import no.uib.echo.schema.User
import no.uib.echo.schema.UserJson
import no.uib.echo.schema.Whitelist
import no.uib.echo.schema.validStudentGroups
import org.flywaydb.core.Flyway
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.batchInsert
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.transactions.transaction
import org.joda.time.DateTime
import java.net.URI

private const val DEFAULT_DEV_POOL_SIZE = 7
private const val DEFAULT_PROD_POOL_SIZE = 20

val tables: Array<Table> = arrayOf(
    Happening,
    StudentGroupHappeningRegistration,
    Registration,
    Answer,
    SpotRange,
    User,
    Feedback,
    StudentGroup,
    StudentGroupMembership,
    Reaction,
    Whitelist,
)

class DatabaseHandler(
    private val env: Environment,
    private val migrateDb: Boolean,
    dbUrl: URI,
    mbMaxPoolSize: String?
) {
    private val dbPort = if (dbUrl.port == -1) 5432 else dbUrl.port
    private val dbUrlStr = "jdbc:postgresql://${dbUrl.host}:${dbPort}${dbUrl.path}"
    private val dbUsername = dbUrl.userInfo.split(":")[0]
    private val dbPassword = dbUrl.userInfo.split(":")[1]

    // MAX_POOL_SIZE takes precedence if it is not null, else we have defaults for prod and dev/preview defined above.
    private val maxPoolSize =
        mbMaxPoolSize?.toIntOrNull()
            ?: if (env == Environment.PRODUCTION)
                DEFAULT_PROD_POOL_SIZE
            else
                DEFAULT_DEV_POOL_SIZE

    private fun dataSource(): HikariDataSource {
        return HikariDataSource(
            HikariConfig().apply {
                jdbcUrl = dbUrlStr
                username = dbUsername
                password = dbPassword
                driverClassName = "org.postgresql.Driver"
                connectionTimeout = 1000
                maximumPoolSize = maxPoolSize
            }
        )
    }

    /*
        !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        IT'S VERY IMPORTANT THAT baselineVersion MATCHES THE LATEST VERSION,
        GIVEN BY THE NAME OF THE SQL FILE IN src/main/resources/db/migration
        WITH THE HIGHEST PREFIX. I.E., "V29__xyz_abc.sql" IS VERSION "29".
        !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    */
    private val flyway: Flyway =
        Flyway.configure().baselineVersion("28").cleanDisabled(false).dataSource(dbUrlStr, dbUsername, dbPassword)
            .load()

    private val conn by lazy {
        Database.connect(dataSource())
    }

    fun init(insertTestData: Boolean = true) {
        // Need to use connection once to open.
        transaction(conn) {}

        // Migrate and return if in prod
        if (env == Environment.PRODUCTION || migrateDb) {
            flyway.migrate()
            return
        }

        // Try to migrate and return if in dev
        if (env == Environment.DEVELOPMENT) {
            try {
                flyway.migrate()
                return
            } catch (e: Exception) {
                System.err.println("Migration failed, will try to create tables & baseline instead.")
                // Remove flyway schema history table that was created by flyway.migrate()
                flyway.clean()
            }
        }

        try {
            transaction { SchemaUtils.create(*tables) }
        } catch (e: Exception) {
            System.err.println("Error creating tables, assuming they already exists.")
        }

        if (insertTestData) insertTestData()

        flyway.baseline()
        // Try to migrate as well to confirm we are good.
        flyway.migrate()
    }

    private fun insertTestData() {
        val happenings = listOf(
            HappeningJson(
                "bedriftspresentasjon-med-bekk",
                "Bedpres med Bekk",
                "021-05-06T16:46+01:00",
                "2030-03-09T16:15+01:00",
                spotRanges = listOf(
                    SpotRangeJson(
                        11,
                        1,
                        2
                    ),
                    SpotRangeJson(
                        9,
                        3,
                        5
                    )
                ),
                HAPPENING_TYPE.BEDPRES,
                validStudentGroups[1]
            ),
            HappeningJson(
                "fest-med-tilde",
                "Fest med Tilde!",
                "2021-05-06T16:46+01:00",
                "2030-06-02T14:20+01:00",
                spotRanges = listOf(
                    SpotRangeJson(
                        20,
                        1,
                        5
                    )
                ),
                HAPPENING_TYPE.EVENT,
                validStudentGroups[2]
            )
        )

        val adminTestUser = UserJson(
            "test.mctest@student.uib.no",
            "Test McTest",
            memberships = listOf("webkom"),
            createdAt = DateTime.now().toString(),
            modifiedAt = DateTime.now().toString()
        )

        try {
            transaction {
                StudentGroup.batchInsert(validStudentGroups) {
                    this[StudentGroup.name] = it
                }

                User.insert {
                    it[User.email] = adminTestUser.email
                    it[User.name] = adminTestUser.name
                }

                StudentGroupMembership.batchInsert(adminTestUser.memberships) {
                    this[StudentGroupMembership.userEmail] = adminTestUser.email
                    this[StudentGroupMembership.studentGroupName] = it
                }

                Happening.batchInsert(happenings) {
                    this[Happening.slug] = it.slug
                    this[Happening.title] = it.title
                    this[Happening.happeningType] = it.type.toString()
                    this[Happening.registrationDate] = DateTime(it.registrationDate)
                    this[Happening.happeningDate] = DateTime(it.happeningDate)
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
