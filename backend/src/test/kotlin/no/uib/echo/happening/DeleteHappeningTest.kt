package no.uib.echo.happening

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.basicAuth
import io.ktor.client.request.delete
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.testing.testApplication
import no.uib.echo.be
import no.uib.echo.hap1
import no.uib.echo.plugins.Routing
import no.uib.echo.schema.Answer
import no.uib.echo.schema.Happening
import no.uib.echo.schema.Registration
import no.uib.echo.schema.SpotRange
import no.uib.echo.schema.User
import no.uib.echo.schema.insertOrUpdateHappening
import no.uib.echo.schema.removeSlug
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction

class DeleteHappeningTest : StringSpec({
    beforeSpec {
        for (t in be) {
            insertOrUpdateHappening(
                removeSlug(hap1(t)), hap1(t).slug, null, sendEmail = false, dev = true
            )
        }
    }

    beforeTest {
        transaction {
            SchemaUtils.drop(
                Happening,
                Registration,
                Answer,
                SpotRange,
                User
            )
            SchemaUtils.create(
                Happening,
                Registration,
                Answer,
                SpotRange,
                User
            )
        }
    }

    "When trying to delete a happening, server should respond with OK." {
        testApplication {
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
            }

            for (t in be) {
                val testCall = client.delete(routeWithSlug(hap1(t).slug)) {
                    basicAuth("admin", System.getenv("ADMIN_KEY"))
                }

                testCall.status shouldBe HttpStatusCode.OK
            }
        }
    }

    "When trying to delete a happening with wrong Authorization header, server should respond with UNAUTHORIZED." {
        testApplication {
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
            }

            for (t in be) {
                val testCall = client.delete(routeWithSlug(hap1(t).slug)) {
                    basicAuth("admin", "wrong-password")
                }

                testCall.status shouldBe HttpStatusCode.Unauthorized
            }
        }
    }
})

private fun routeWithSlug(slug: String): String {
    return Routing.deleteHappeningRoute.replace("{slug}", slug)
}
