package no.uib.echo

import com.google.gson.Gson
import io.ktor.server.testing.*

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import no.uib.echo.plugins.Routing

import no.uib.echo.plugins.configureRouting
import no.uib.echo.schema.*
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.Base64

class HappeningTest : StringSpec({
    val everyoneSpotRange = listOf(SpotRangeJson(50, 1, 5))
    val exampleHappening: (type: HAPPENING_TYPE) -> HappeningJson =
        { type -> HappeningJson("${type}-med-noen", "2020-04-29T20:43:29Z", everyoneSpotRange, type) }
    val exampleHappeningSlug: (type: HAPPENING_TYPE) -> HappeningSlugJson =
        { type -> HappeningSlugJson(exampleHappening(type).slug, type)}

    val gson = Gson()

    val be = listOf(HAPPENING_TYPE.BEDPRES, HAPPENING_TYPE.EVENT)

    val admin = "admin"
    val keys = mapOf(
        admin to "admin-passord"
    )

    val auth = "$admin:${keys[admin]}"

    beforeSpec { Db.init() }
    beforeTest {
        transaction {
            addLogger(StdOutSqlLogger)

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
            configureRouting(keys)
        }) {
            for (t in be) {
                val testCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        addHeader(
                            HttpHeaders.Authorization,
                            "Basic ${Base64.getEncoder().encodeToString(auth.toByteArray())}"
                        )
                        setBody(gson.toJson(exampleHappening(t)))
                    }

                testCall.response.status() shouldBe HttpStatusCode.OK
            }
        }
    }

    "Whe trying to update happening spots, server should respond with OK." {
        withTestApplication({
            configureRouting(keys)
        }) {
            for (t in be) {
                val submitBedpresCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        addHeader(
                            HttpHeaders.Authorization,
                            "Basic ${Base64.getEncoder().encodeToString(auth.toByteArray())}"
                        )
                        setBody(gson.toJson(exampleHappening(t)))
                    }

                submitBedpresCall.response.status() shouldBe HttpStatusCode.OK

                val updateBedpresCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        addHeader(
                            HttpHeaders.Authorization,
                            "Basic ${Base64.getEncoder().encodeToString(auth.toByteArray())}"
                        )
                        setBody(gson.toJson(exampleHappening(t).copy(spotRanges = listOf(everyoneSpotRange[0].copy(spots = 123)))))
                    }

                updateBedpresCall.response.status() shouldBe HttpStatusCode.OK
            }
        }
    }

    "When trying to update a happening with the exact same values, server should respond with ACCEPTED." {
        withTestApplication({
            configureRouting(keys)
        }) {
            for (t in be) {
                val submitBedpresCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        addHeader(
                            HttpHeaders.Authorization,
                            "Basic ${Base64.getEncoder().encodeToString(auth.toByteArray())}"
                        )
                        setBody(gson.toJson(exampleHappening(t)))
                    }

                submitBedpresCall.response.status() shouldBe HttpStatusCode.OK

                val updateBedpresCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        addHeader(
                            HttpHeaders.Authorization,
                            "Basic ${Base64.getEncoder().encodeToString(auth.toByteArray())}"
                        )
                        setBody(gson.toJson(exampleHappening(t)))
                    }

                updateBedpresCall.response.status() shouldBe HttpStatusCode.Accepted
            }
        }
    }

    "When trying to submit a happening with bad data, server should respond with INTERNAL_SERVER_ERROR." {
        withTestApplication({
            configureRouting(keys)
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
            configureRouting(keys)
        }) {
            val wrongAuth = "$admin:damn-feil-passord-100"

            for (t in be) {
                val testCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        addHeader(
                            HttpHeaders.Authorization,
                            "Basic ${Base64.getEncoder().encodeToString(wrongAuth.toByteArray())}"
                        )
                        setBody(gson.toJson(exampleHappening(t)))
                    }

                testCall.response.status() shouldBe HttpStatusCode.Unauthorized
            }
        }
    }

    "When trying to delete a happening with wrong Authorization header, server should respond with UNAUTHORIZED." {
        withTestApplication({
            configureRouting(keys)
        }) {
            val wrongAuth = "$admin:damn-feil-passord-100"

            for (t in be) {
                val testCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Delete, uri = "/${Routing.happeningRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        addHeader(
                            HttpHeaders.Authorization,
                            "Basic ${Base64.getEncoder().encodeToString(wrongAuth.toByteArray())}"
                        )
                        setBody(gson.toJson(exampleHappeningSlug(t)))
                    }

                testCall.response.status() shouldBe HttpStatusCode.Unauthorized
            }
        }
    }
})
