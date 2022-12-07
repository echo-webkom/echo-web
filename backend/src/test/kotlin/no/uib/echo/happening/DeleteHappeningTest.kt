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
import no.uib.echo.Environment
import no.uib.echo.be
import no.uib.echo.hap1
import no.uib.echo.schema.StudentGroup
import no.uib.echo.schema.insertOrUpdateHappening
import no.uib.echo.schema.validStudentGroups
import no.uib.echo.tables
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.batchInsert
import org.jetbrains.exposed.sql.transactions.transaction
import java.net.URI
import kotlin.test.AfterTest
import kotlin.test.BeforeTest
import kotlin.test.Test

class DeleteHappeningTest {
    companion object {
        val db = DatabaseHandler(
            env = Environment.PREVIEW,
            migrateDb = false,
            dbUrl = URI(System.getenv("DATABASE_URL")),
            mbMaxPoolSize = null
        )
    }

    @BeforeTest
    fun beforeTest() {
        db.init(false)
        insertTestData()
    }

    @AfterTest
    fun afterTest() {
        transaction {
            SchemaUtils.drop(*tables)
            SchemaUtils.create(*tables)
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

private fun insertTestData() {
    transaction {
        StudentGroup.batchInsert(validStudentGroups) {
            this[StudentGroup.name] = it
        }
    }

    for (t in be) {
        insertOrUpdateHappening(hap1(t))
    }
}
