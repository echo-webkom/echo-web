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

class BedpresTest : StringSpec({
    val exampleBedpres = HappeningJson("bedpres-med-noen", 420, 1, 5, "2021-04-29T20:43:29Z", HAPPENING_TYPE.BEDPRES)
    val exampleBedpresSlug = HappeningSlugJson(exampleBedpres.slug, exampleBedpres.type)
    val gson = Gson()

    val webkom = "webkom"
    val keys = mapOf(
        webkom to "webkom-passord"
    )
    val auth = "$webkom:${keys[webkom]}"

    beforeSpec { Db.init() }
    beforeTest {
        transaction {
            addLogger(StdOutSqlLogger)

            SchemaUtils.drop(Bedpres, Event, BedpresRegistration, EventRegistration, BedpresAnswer, EventAnswer)
            SchemaUtils.create(Bedpres, Event, BedpresRegistration, EventRegistration, BedpresAnswer, EventAnswer)
        }
    }


    "When trying to submit a bedpres, server should respond with OK." {
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
                    setBody(gson.toJson(exampleBedpres))
                }

            testCall.response.status() shouldBe HttpStatusCode.OK
        }
    }

    "Whe trying to update bedpres spots, server should respond with OK." {
        withTestApplication({
            configureRouting(keys)
        }) {
            val submitBedpresCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    addHeader(
                        HttpHeaders.Authorization,
                        "Basic ${Base64.getEncoder().encodeToString(auth.toByteArray())}"
                    )
                    setBody(gson.toJson(exampleBedpres))
                }

            submitBedpresCall.response.status() shouldBe HttpStatusCode.OK

            val updateBedpresCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    addHeader(
                        HttpHeaders.Authorization,
                        "Basic ${Base64.getEncoder().encodeToString(auth.toByteArray())}"
                    )
                    setBody(gson.toJson(exampleBedpres.copy(spots = 123)))
                }

            updateBedpresCall.response.status() shouldBe HttpStatusCode.OK
        }
    }

    "When trying to update a bedpres with the excact same values, server should respond with ACCEPTED." {
        withTestApplication({
            configureRouting(keys)
        }) {
            val submitBedpresCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    addHeader(
                        HttpHeaders.Authorization,
                        "Basic ${Base64.getEncoder().encodeToString(auth.toByteArray())}"
                    )
                    setBody(gson.toJson(exampleBedpres))
                }

            submitBedpresCall.response.status() shouldBe HttpStatusCode.OK

            val updateBedpresCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    addHeader(
                        HttpHeaders.Authorization,
                        "Basic ${Base64.getEncoder().encodeToString(auth.toByteArray())}"
                    )
                    setBody(gson.toJson(exampleBedpres))
                }

            updateBedpresCall.response.status() shouldBe HttpStatusCode.Accepted
        }
    }

    "When trying to submit a bedpres with bad data, server should respond with INTERNAL_SERVER_ERROR." {
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

    "When trying to submit or update a bedpres with wrong Authorization header, server should respond with UNAUTHORIZED." {
        withTestApplication({
            configureRouting(keys)
        }) {
            val wrongAuth = "$webkom:damn-feil-passord-100"

            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    addHeader(
                        HttpHeaders.Authorization,
                        "Basic ${Base64.getEncoder().encodeToString(wrongAuth.toByteArray())}"
                    )
                    setBody(gson.toJson(exampleBedpres))
                }

            testCall.response.status() shouldBe HttpStatusCode.Unauthorized
        }
    }

    "When trying to delete a bedpres with wrong Authorization header, server should respond with UNAUTHORIZED." {
        withTestApplication({
            configureRouting(keys)
        }) {
            val wrongAuth = "$webkom:damn-feil-passord-100"

            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Delete, uri = "/${Routing.happeningRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    addHeader(
                        HttpHeaders.Authorization,
                        "Basic ${Base64.getEncoder().encodeToString(wrongAuth.toByteArray())}"
                    )
                    setBody(gson.toJson(exampleBedpresSlug))
                }

            testCall.response.status() shouldBe HttpStatusCode.Unauthorized
        }
    }
})
