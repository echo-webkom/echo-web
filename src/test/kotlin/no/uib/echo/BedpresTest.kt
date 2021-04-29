package no.uib.echo

import io.kotest.core.spec.BeforeTest
import io.ktor.server.testing.*
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode

import no.uib.echo.plugins.configureRouting

val initDb: BeforeTest = {
    Db.init()
    System.err.println("bruh")
}

class BedpresTest : StringSpec({

    beforeTest(initDb)

    "PUT request on /bedpres with correct payload should return OK" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall = handleRequest(method = HttpMethod.Put, uri = "/bedpres") {
                addHeader(HttpHeaders.ContentType, "application/json")
                addHeader(HttpHeaders.Authorization, "secret")
                setBody("""{ "slug": "bedpres-med-noen", "spots": 69, "registrationDate": "2021-04-29T20:43:29Z" }""")
            }

            testCall.response.status() shouldBe HttpStatusCode.OK
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
                setBody("""{ "slug": "bedpres-med-noen" }""")
            }

            testCall.response.status() shouldBe HttpStatusCode.Unauthorized
        }
    }
})