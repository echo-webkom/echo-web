package no.uib.echo.happening

import io.kotest.matchers.shouldBe
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.request.basicAuth
import io.ktor.client.request.delete
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.testing.testApplication
import no.uib.echo.DatabaseHandler
import no.uib.echo.be
import no.uib.echo.hap1
import no.uib.echo.schema.Answer
import no.uib.echo.schema.Feedback
import no.uib.echo.schema.HAPPENING_TYPE
import no.uib.echo.schema.Happening
import no.uib.echo.schema.Reaction
import no.uib.echo.schema.Registration
import no.uib.echo.schema.SpotRange
import no.uib.echo.schema.StudentGroup
import no.uib.echo.schema.StudentGroupMembership
import no.uib.echo.schema.User
import no.uib.echo.schema.insertOrUpdateHappening
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.batchInsert
import org.jetbrains.exposed.sql.transactions.transaction
import org.junit.AfterClass
import java.net.URI
import kotlin.test.AfterTest
import kotlin.test.BeforeTest
import kotlin.test.Test
import no.uib.echo.schema.validStudentGroups

class DeleteHappeningTest {
    companion object {
        init {
            DatabaseHandler(
                dev = true,
                testMigration = false,
                dbUrl = URI(System.getenv("DATABASE_URL")),
                mbMaxPoolSize = "150"
            ).init(shouldInsertTestData = false)
        }

        @AfterClass
        @JvmStatic
        fun afterClass() {
            SchemaUtils.dropDatabase("postgres")
        }
    }

    @BeforeTest
    fun beforeTest() {
        for (t in be) {
            insertTestData(t)
        }
    }

    @AfterTest
    fun afterTest() {
        transaction {
            SchemaUtils.drop(
                Happening,
                Registration,
                Answer,
                SpotRange,
                User,
                Feedback,
                StudentGroup,
                StudentGroupMembership,
                Reaction
            )
            SchemaUtils.create(
                Happening,
                Registration,
                Answer,
                SpotRange,
                User,
                Feedback,
                StudentGroup,
                StudentGroupMembership,
                Reaction
            )
        }
    }

    @Test
    fun `When trying to delete a happening, server should respond with OK`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                val testCall = client.delete("/happening/${hap1(t).slug}") {
                    basicAuth("admin", System.getenv("ADMIN_KEY"))
                }

                testCall.status shouldBe HttpStatusCode.OK
            }
        }

    @Test
    fun `When trying to delete a happening with wrong Authorization header, server should respond with UNAUTHORIZED`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                val testCall = client.delete("/happening/${hap1(t).slug}") {
                    basicAuth("admin", "wrong-password")
                }

                testCall.status shouldBe HttpStatusCode.Unauthorized
            }
        }
}

private fun insertTestData(t: HAPPENING_TYPE) {
    transaction {
        addLogger(StdOutSqlLogger)

        StudentGroup.batchInsert(validStudentGroups, ignore = true) {
            this[StudentGroup.name] = it
        }
    }
    insertOrUpdateHappening(hap1(t))
}
