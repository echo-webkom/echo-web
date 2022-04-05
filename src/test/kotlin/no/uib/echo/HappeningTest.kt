package no.uib.echo

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.server.testing.TestApplicationCall
import io.ktor.server.testing.handleRequest
import io.ktor.server.testing.setBody
import io.ktor.server.testing.withTestApplication
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import no.uib.echo.plugins.Routing
import no.uib.echo.plugins.configureRouting
import no.uib.echo.schema.Answer
import no.uib.echo.schema.HAPPENING_TYPE
import no.uib.echo.schema.Happening
import no.uib.echo.schema.HappeningJson
import no.uib.echo.schema.HappeningSlugJson
import no.uib.echo.schema.Registration
import no.uib.echo.schema.SpotRange
import no.uib.echo.schema.SpotRangeJson
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import java.net.URI
import java.util.Base64

class HappeningTest : StringSpec({
    val everyoneSpotRange = listOf(SpotRangeJson(50, 1, 5))
    val exampleHappening: (type: HAPPENING_TYPE) -> HappeningJson =
        { type ->
            HappeningJson(
                "$type-med-noen",
                ",$type med Noen!",
                "2020-04-29T20:43:29Z",
                "2030-04-29T20:43:29Z",
                everyoneSpotRange,
                type,
                "test@test.com"
            )
        }
    val exampleHappeningSlug: (type: HAPPENING_TYPE) -> HappeningSlugJson =
        { type -> HappeningSlugJson(exampleHappening(type).slug, type) }

    val be = listOf(HAPPENING_TYPE.BEDPRES, HAPPENING_TYPE.EVENT)
    val adminKey = "admin-passord"
    val auth = "admin:$adminKey"
    val featureToggles = FeatureToggles(sendEmailReg = false, sendEmailHap = false, rateLimit = false, verifyRegs = false)

    beforeSpec { DatabaseHandler(true, URI(System.getenv("DATABASE_URL")), null).init() }
    beforeTest {
        transaction {
            SchemaUtils.drop(
                Happening,
                Registration,
                Answer,
                SpotRange
            )
            SchemaUtils.create(
                Happening,
                Registration,
                Answer,
                SpotRange
            )
        }
    }

    "When trying to submit a happening, server should respond with OK." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            for (t in be) {
                val testCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        addHeader(
                            HttpHeaders.Authorization,
                            "Basic ${Base64.getEncoder().encodeToString(auth.toByteArray())}"
                        )
                        setBody(Json.encodeToString(exampleHappening(t)))
                    }

                testCall.response.status() shouldBe HttpStatusCode.OK
            }
        }
    }

    "Whe trying to update happening spots, server should respond with OK." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            for (t in be) {
                val submitHappeningCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        addHeader(
                            HttpHeaders.Authorization,
                            "Basic ${Base64.getEncoder().encodeToString(auth.toByteArray())}"
                        )
                        setBody(Json.encodeToString(exampleHappening(t)))
                    }

                submitHappeningCall.response.status() shouldBe HttpStatusCode.OK

                val updateHappeningCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        addHeader(
                            HttpHeaders.Authorization,
                            "Basic ${Base64.getEncoder().encodeToString(auth.toByteArray())}"
                        )
                        setBody(Json.encodeToString(exampleHappening(t).copy(spotRanges = listOf(everyoneSpotRange[0].copy(spots = 123)))))
                    }

                updateHappeningCall.response.status() shouldBe HttpStatusCode.OK
            }
        }
    }

    "When trying to update a happening with the exact same values, server should respond with ACCEPTED." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            for (t in be) {
                val submitBedpresCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        addHeader(
                            HttpHeaders.Authorization,
                            "Basic ${Base64.getEncoder().encodeToString(auth.toByteArray())}"
                        )
                        setBody(Json.encodeToString(exampleHappening(t)))
                    }

                submitBedpresCall.response.status() shouldBe HttpStatusCode.OK

                val updateBedpresCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        addHeader(
                            HttpHeaders.Authorization,
                            "Basic ${Base64.getEncoder().encodeToString(auth.toByteArray())}"
                        )
                        setBody(Json.encodeToString(exampleHappening(t)))
                    }

                updateBedpresCall.response.status() shouldBe HttpStatusCode.Accepted
            }
        }
    }

    "When trying to submit a happening with bad data, server should respond with INTERNAL_SERVER_ERROR." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    addHeader(
                        HttpHeaders.Authorization,
                        "Basic ${Base64.getEncoder().encodeToString(auth.toByteArray())}"
                    )
                    setBody("""{ "spots": 69, "registrationDate": "2021-04-29T20:43:29Z" }""")
                }

            testCall.response.status() shouldBe HttpStatusCode.InternalServerError
        }
    }

    "When trying to submit or update a happening with wrong Authorization header, server should respond with UNAUTHORIZED." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            val wrongAuth = "admin:damn-feil-passord-100"

            for (t in be) {
                val testCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        addHeader(
                            HttpHeaders.Authorization,
                            "Basic ${Base64.getEncoder().encodeToString(wrongAuth.toByteArray())}"
                        )
                        setBody(Json.encodeToString(exampleHappening(t)))
                    }

                testCall.response.status() shouldBe HttpStatusCode.Unauthorized
            }
        }
    }

    "When trying to delete a happening with wrong Authorization header, server should respond with UNAUTHORIZED." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            val wrongAuth = "admin:damn-feil-passord-100"

            for (t in be) {
                val testCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Delete, uri = "/${Routing.happeningRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        addHeader(
                            HttpHeaders.Authorization,
                            "Basic ${Base64.getEncoder().encodeToString(wrongAuth.toByteArray())}"
                        )
                        setBody(Json.encodeToString(exampleHappeningSlug(t)))
                    }

                testCall.response.status() shouldBe HttpStatusCode.Unauthorized
            }
        }
    }
})
