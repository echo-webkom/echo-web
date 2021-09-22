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

class EventTest : StringSpec({
    val exampleEvent = HappeningJson("fest-med-tilde", 420, 1, 5, "2021-04-29T20:43:29Z", HAPPENING_TYPE.EVENT)
    val exampleEventSlug = HappeningSlugJson(exampleEvent.slug, exampleEvent.type)
    val gson = Gson()

    val admin = "admin"
    val keys = mapOf(
        admin to "admin-passord"
    )
    val auth = "$admin:${keys[admin]}"

    beforeSpec { Db.init() }
    beforeTest {
        transaction {
            addLogger(StdOutSqlLogger)

            SchemaUtils.drop(Bedpres, Event, BedpresRegistration, EventRegistration, BedpresAnswer, EventAnswer)
            SchemaUtils.create(Bedpres, Event, BedpresRegistration, EventRegistration, BedpresAnswer, EventAnswer)
        }
    }


    "When trying to submit a event, server should respond with OK." {
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
                    setBody(gson.toJson(exampleEvent))
                }

            testCall.response.status() shouldBe HttpStatusCode.OK
        }
    }

    "Whe trying to update event spots, server should respond with OK." {
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
                    setBody(gson.toJson(exampleEvent))
                }

            submitBedpresCall.response.status() shouldBe HttpStatusCode.OK

            val updateBedpresCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    addHeader(
                        HttpHeaders.Authorization,
                        "Basic ${Base64.getEncoder().encodeToString(auth.toByteArray())}"
                    )
                    setBody(gson.toJson(exampleEvent.copy(spots = 123)))
                }

            updateBedpresCall.response.status() shouldBe HttpStatusCode.OK
        }
    }

    "When trying to update a event with the excact same values, server should respond with ACCEPTED." {
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
                    setBody(gson.toJson(exampleEvent))
                }

            submitBedpresCall.response.status() shouldBe HttpStatusCode.OK

            val updateBedpresCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    addHeader(
                        HttpHeaders.Authorization,
                        "Basic ${Base64.getEncoder().encodeToString(auth.toByteArray())}"
                    )
                    setBody(gson.toJson(exampleEvent))
                }

            updateBedpresCall.response.status() shouldBe HttpStatusCode.Accepted
        }
    }

    "When trying to submit a event with bad data, server should respond with INTERNAL_SERVER_ERROR." {
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

    "When trying to submit or update a event with wrong Authorization header, server should respond with UNAUTHORIZED." {
        withTestApplication({
            configureRouting(keys)
        }) {
            val wrongAuth = "$admin:damn-feil-passord-100"

            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    addHeader(
                        HttpHeaders.Authorization,
                        "Basic ${Base64.getEncoder().encodeToString(wrongAuth.toByteArray())}"
                    )
                    setBody(gson.toJson(exampleEvent))
                }

            testCall.response.status() shouldBe HttpStatusCode.Unauthorized
        }
    }

    "When trying to delete a event with wrong Authorization header, server should respond with UNAUTHORIZED." {
        withTestApplication({
            configureRouting(keys)
        }) {
            val wrongAuth = "$admin:damn-feil-passord-100"

            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Delete, uri = "/${Routing.happeningRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    addHeader(
                        HttpHeaders.Authorization,
                        "Basic ${Base64.getEncoder().encodeToString(wrongAuth.toByteArray())}"
                    )
                    setBody(gson.toJson(exampleEventSlug))
                }

            testCall.response.status() shouldBe HttpStatusCode.Unauthorized
        }
    }
})
