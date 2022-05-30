package no.uib.echo.happening

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.ktor.client.HttpClient
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
import no.uib.echo.be
import no.uib.echo.everyoneSpotRange
import no.uib.echo.hap1
import no.uib.echo.plugins.Routing.putHappeningRoute
import no.uib.echo.schema.Happening
import no.uib.echo.schema.SpotRange
import no.uib.echo.schema.removeSlug
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import java.net.URI

class PutHappeningTest : StringSpec({
    val client = HttpClient {
        install(Logging)
        install(ContentNegotiation) {
            json()
        }
    }

    beforeSpec {
        DatabaseHandler(true, URI(System.getenv("DATABASE_URL")), null).init()
    }
    afterSpec {
        client.close()
    }

    beforeTest {
        transaction {
            SchemaUtils.drop(
                Happening, SpotRange
            )
            SchemaUtils.create(
                Happening, SpotRange
            )
        }
    }

    "When trying to submit a happening, server should respond with OK." {
        testApplication {
            for (t in be) {
                val testCall = client.put(routeWithSlug(hap1(t).slug)) {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(removeSlug(hap1(t))))
                }

                testCall.status shouldBe HttpStatusCode.OK
            }
        }
    }

    "Whe trying to update happening spots, server should respond with OK." {
        testApplication {
            for (t in be) {
                val submitHappeningCall = client.put(routeWithSlug(hap1(t).slug)) {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(removeSlug(hap1(t))))
                }

                submitHappeningCall.status shouldBe HttpStatusCode.OK

                val updateHappeningCall = client.put(routeWithSlug(hap1(t).slug)) {
                    contentType(ContentType.Application.Json)
                    basicAuth("admin", System.getenv("ADMIN_KEY"))
                    setBody(
                        Json.encodeToString(
                            removeSlug(hap1(t)).copy(
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
    }

    "When trying to update a happening with the exact same values, server should respond with ACCEPTED." {
        testApplication {
            for (t in be) {
                val submitBedpresCall = client.put(routeWithSlug(hap1(t).slug)) {
                    contentType(ContentType.Application.Json)
                    basicAuth("admin", System.getenv("ADMIN_KEY"))
                    setBody(Json.encodeToString(removeSlug(hap1(t))))
                }

                submitBedpresCall.status shouldBe HttpStatusCode.OK

                val updateBedpresCall = client.put(routeWithSlug(hap1(t).slug)) {
                    contentType(ContentType.Application.Json)
                    basicAuth("admin", System.getenv("ADMIN_KEY"))
                    setBody(Json.encodeToString(removeSlug(hap1(t))))
                }

                updateBedpresCall.status shouldBe HttpStatusCode.Accepted
            }
        }
    }

    "When trying to submit a happening with bad data, server should respond with INTERNAL_SERVER_ERROR." {
        testApplication {
            for (t in be) {
                val testCall = client.put(routeWithSlug(hap1(t).slug)) {
                    contentType(ContentType.Application.Json)
                    basicAuth("admin", System.getenv("ADMIN_KEY"))
                    setBody("""{ "spots": 69, "registrationDate": "2021-04-29T20:43:29Z" }""")
                }

                testCall.status shouldBe HttpStatusCode.InternalServerError
            }
        }
    }

    "When trying to submit or update a happening with wrong Authorization header, server should respond with UNAUTHORIZED." {
        testApplication {
            for (t in be) {
                val testCall = client.put(routeWithSlug(hap1(t).slug)) {
                    contentType(ContentType.Application.Json)
                    basicAuth("admin", "bruh-123")
                    setBody(Json.encodeToString(removeSlug(hap1(t))))
                }

                testCall.status shouldBe HttpStatusCode.Unauthorized
            }
        }
    }
})

private fun routeWithSlug(slug: String): String {
    return putHappeningRoute.replace("{slug}", slug)
}
