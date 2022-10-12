package no.uib.echo.happening

import io.kotest.matchers.shouldBe
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.request.basicAuth
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.testing.testApplication
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import no.uib.echo.DatabaseHandler
import no.uib.echo.adminKey
import no.uib.echo.be
import no.uib.echo.everyoneSpotRange
import no.uib.echo.hap1
import no.uib.echo.schema.Answer
import no.uib.echo.schema.Feedback
import no.uib.echo.schema.Happening
import no.uib.echo.schema.Registration
import no.uib.echo.schema.SpotRange
import no.uib.echo.schema.StudentGroup
import no.uib.echo.schema.StudentGroupMembership
import no.uib.echo.schema.User
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

class PutHappeningTest {
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
            transaction {
                addLogger(StdOutSqlLogger)

                SchemaUtils.dropDatabase("postgres")
            }
        }
    }

    @BeforeTest
    fun beforeTest() {
        for (t in be) {
            insertTestData()
        }
    }

    @AfterTest
    fun afterTest() {
        transaction {
            SchemaUtils.drop(
                Happening, Registration, Answer, SpotRange, User, Feedback, StudentGroup, StudentGroupMembership
            )
            SchemaUtils.create(
                Happening, Registration, Answer, SpotRange, User, Feedback, StudentGroup, StudentGroupMembership
            )
        }
    }

    @Test
    fun `When trying to submit a happening, server should respond with OK`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                val submitHappeningCall = client.put("/happening") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(hap1(t)))
                    basicAuth("admin", adminKey)
                }

                submitHappeningCall.status shouldBe HttpStatusCode.OK
            }
        }

    @Test
    fun `When trying to update happening spots, server should respond with OK`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                val submitHappeningCall = client.put("/happening") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(hap1(t)))
                    basicAuth("admin", adminKey)
                }

                submitHappeningCall.status shouldBe HttpStatusCode.OK

                val updateHappeningCall = client.put("/happening") {
                    contentType(ContentType.Application.Json)
                    basicAuth("admin", adminKey)
                    setBody(
                        Json.encodeToString(
                            hap1(t).copy(
                                spotRanges = listOf(
                                    everyoneSpotRange[0].copy(
                                        spots = 123
                                    )
                                )
                            )
                        )
                    )
                }

                updateHappeningCall.status shouldBe HttpStatusCode.OK
            }
        }

    @Test
    fun `When trying to update a happening with the exact same values, server should respond with ACCEPTED`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                val submitHappeningCall = client.put("/happening") {
                    contentType(ContentType.Application.Json)
                    basicAuth("admin", adminKey)
                    setBody(Json.encodeToString(hap1(t)))
                }

                submitHappeningCall.status shouldBe HttpStatusCode.OK

                val updateHappeningCall = client.put("/happening") {
                    contentType(ContentType.Application.Json)
                    basicAuth("admin", adminKey)
                    setBody(Json.encodeToString(hap1(t)))
                }

                updateHappeningCall.status shouldBe HttpStatusCode.Accepted
            }
        }

    @Test
    fun `When trying to submit a happening with bad data, server should respond with INTERNAL_SERVER_ERROR`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                val submitHappeningCall = client.put("/happening") {
                    contentType(ContentType.Application.Json)
                    basicAuth("admin", adminKey)
                    setBody("""{ "spots": 69, "registrationDate": "2021-04-29T20:43:29Z" }""")
                }

                submitHappeningCall.status shouldBe HttpStatusCode.InternalServerError
            }
        }

    @Test
    fun `When trying to submit or update a happening with wrong Authorization header, server should respond with UNAUTHORIZED`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                val submitHappeningCall = client.put("/happening") {
                    contentType(ContentType.Application.Json)
                    basicAuth("admin", "bruh-123")
                    setBody(Json.encodeToString(hap1(t)))
                }

                submitHappeningCall.status shouldBe HttpStatusCode.Unauthorized
            }
        }
}

private fun insertTestData() {
    transaction {
        addLogger(StdOutSqlLogger)

        StudentGroup.batchInsert(listOf("bedkom", "tilde"), ignore = true) {
            this[StudentGroup.name] = it
        }
    }
}
