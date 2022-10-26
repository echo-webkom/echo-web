package no.uib.echo

import io.kotest.matchers.shouldBe
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.request.get
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.testing.testApplication
import io.ktor.util.InternalAPI
import no.uib.echo.schema.ReactionsJson
import org.jetbrains.exposed.sql.SchemaUtils
import org.junit.AfterClass
import java.net.URI
import kotlin.test.Test

class ReactionTest {
    companion object {
        init {
            DatabaseHandler(
                dev = true,
                testMigration = false,
                dbUrl = URI(System.getenv("DATABASE_URL")),
                mbMaxPoolSize = "150"
            ).init(shouldInsertTestData = true)
        }

        @AfterClass
        @JvmStatic
        fun afterClass() {
            SchemaUtils.dropDatabase("postgres")
        }
    }

    @OptIn(InternalAPI::class)
    @Test
    fun `Happening should start with no reactions`() {
        testApplication {
            val slug = "bedriftspresentasjon-med-bekk"
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }

            val testCall = client.get("/reaction/$slug")

            testCall.status shouldBe HttpStatusCode.OK
            testCall.content.toString() shouldBe ReactionsJson(0, 0, 0, 0, 0).toString()
        }
    }

    @Test
    fun `Non-existing happening should return 404`() {
        testApplication {
            val slug = "this-slug-does-not-exist"
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }

            val testCall = client.get("/reaction/$slug")

            testCall.status shouldBe HttpStatusCode.NotFound
        }
    }
}
