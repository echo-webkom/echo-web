package no.uib.echo

import io.ktor.server.testing.*
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode

import no.uib.echo.plugins.configureRouting
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.transactions.transaction

class BedpresTest : StringSpec({
    val exampleBedpres = BedpresJson("bedpres-med-noen", 420, "2021-04-29T20:43:29Z")
    val exampleBedpresSlug = BedpresSlugJson(exampleBedpres.slug)

    beforeSpec { Db.init() }
    beforeTest {
        transaction {
            addLogger(StdOutSqlLogger)

            SchemaUtils.drop(Registration, Bedpres)
            SchemaUtils.create(Registration, Bedpres)
        }
    }

    fun bedpresToJson(bedpres: BedpresJson): String {
        return """
        {
          "slug": "${bedpres.slug}",
          "spots": ${bedpres.spots},
          "registrationDate": "${bedpres.registrationDate}"
        }
    """.trimIndent().replace("\\s".toRegex(), "")
    }

    fun bedpresSlugToJson(bedpresSlug: BedpresSlugJson): String {
        return """{ "slug": "${bedpresSlug.slug}" }"""
    }

    "PUT request on /bedpres with correct payload should return OK" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall = handleRequest(method = HttpMethod.Put, uri = "/bedpres") {
                addHeader(HttpHeaders.ContentType, "application/json")
                addHeader(HttpHeaders.Authorization, "secret")
                setBody(bedpresToJson(exampleBedpres))
            }

            testCall.response.status() shouldBe HttpStatusCode.OK
        }
    }

    "PUT request on /bedpres with correct payload should return OK, when the slug already exists" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val submitBedpresCall: TestApplicationCall = handleRequest(method = HttpMethod.Put, uri = "/bedpres") {
                addHeader(HttpHeaders.ContentType, "application/json")
                addHeader(HttpHeaders.Authorization, "secret")
                setBody(bedpresToJson(exampleBedpres))
            }

            submitBedpresCall.response.status() shouldBe HttpStatusCode.OK

            val updateBedpresCall: TestApplicationCall = handleRequest(method = HttpMethod.Put, uri = "/bedpres") {
                addHeader(HttpHeaders.ContentType, "application/json")
                addHeader(HttpHeaders.Authorization, "secret")
                setBody(bedpresToJson(exampleBedpres.copy(spots = 123)))
            }

            updateBedpresCall.response.status() shouldBe HttpStatusCode.OK
        }
    }

    "PUT request on /bedpres with correct payload should return ACCEPTED, when the slug already exists and the spots are the same" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val submitBedpresCall: TestApplicationCall = handleRequest(method = HttpMethod.Put, uri = "/bedpres") {
                addHeader(HttpHeaders.ContentType, "application/json")
                addHeader(HttpHeaders.Authorization, "secret")
                setBody(bedpresToJson(exampleBedpres))
            }

            submitBedpresCall.response.status() shouldBe HttpStatusCode.OK

            val updateBedpresCall: TestApplicationCall = handleRequest(method = HttpMethod.Put, uri = "/bedpres") {
                addHeader(HttpHeaders.ContentType, "application/json")
                addHeader(HttpHeaders.Authorization, "secret")
                setBody(bedpresToJson(exampleBedpres))
            }

            updateBedpresCall.response.status() shouldBe HttpStatusCode.Accepted
        }
    }

    "PUT request on /bedpres with incorrect payload should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall = handleRequest(method = HttpMethod.Put, uri = "/bedpres") {
                addHeader(HttpHeaders.ContentType, "application/json")
                addHeader(HttpHeaders.Authorization, "secret")
                setBody("""{ "spots": 69, "registrationDate": "2021-04-29T20:43:29Z" }""")
            }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
        }
    }

    "PUT request on /bedpres with wrong Authorization header should return UNAUTHORIZED" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall = handleRequest(method = HttpMethod.Put, uri = "/bedpres") {
                addHeader(HttpHeaders.Authorization, "feil auth header")
            }

            testCall.response.status() shouldBe HttpStatusCode.Unauthorized
        }
    }

    "DELETE request on /bedpres with wrong Authorization header should return UNAUTHORIZED" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall = handleRequest(method = HttpMethod.Delete, uri = "/bedpres") {
                addHeader(HttpHeaders.ContentType, "application/json")
                addHeader(HttpHeaders.Authorization, "feil auth header")
                setBody(bedpresToJson(exampleBedpres))
                setBody(bedpresSlugToJson(exampleBedpresSlug))
            }

            testCall.response.status() shouldBe HttpStatusCode.Unauthorized
        }
    }
})