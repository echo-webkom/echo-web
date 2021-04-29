package no.uib.echo

import io.ktor.server.testing.*
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode

import no.uib.echo.plugins.configureRouting

class ApplicationTest : StringSpec({
    "GET request on /registration with wrong Authorization header should return UNAUTHORIZED" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall = handleRequest(method = HttpMethod.Get, uri = "/registration") {
                addHeader(HttpHeaders.Authorization, "feil auth header")
            }

            testCall.response.status() shouldBe HttpStatusCode.Unauthorized
        }
    }

    "POST request on /registration with invalid email should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall = handleRequest(method = HttpMethod.Post, uri = "/registration") {
                addHeader(HttpHeaders.ContentType, "application/json")
                setBody(
                    """
                   { "email": "test_test.com",
                     "firstName": "Navn",
                     "lastName": "Navnesen",
                     "degree": "DTEK",
                     "degreeYear": 2,
                     "slug": "bedpres-med-noen",
                     "terms": true
                   }
                   """.trimIndent()
                )
            }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
        }
    }

    "POST request on /registration with degree year smaller than 1 should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall = handleRequest(method = HttpMethod.Post, uri = "/registration") {
                addHeader(HttpHeaders.ContentType, "application/json")
                setBody(
                    """
                   { "email": "test_test.com",
                     "firstName": "Navn",
                     "lastName": "Navnesen",
                     "degree": "DTEK",
                     "degreeYear": 0,
                     "slug": "bedpres-med-noen",
                     "terms": true
                   }
                   """.trimIndent()
                )
            }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
        }
    }

    "POST request on /registration with degree year larger than 5 should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall = handleRequest(method = HttpMethod.Post, uri = "/registration") {
                addHeader(HttpHeaders.ContentType, "application/json")
                setBody(
                    """
                   { "email": "test_test.com",
                     "firstName": "Navn",
                     "lastName": "Navnesen",
                     "degree": "DTEK",
                     "degreeYear": 6,
                     "slug": "bedpres-med-noen",
                     "terms": true
                   }
                   """.trimIndent()
                )
            }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
        }
    }

    "POST request on /registration with terms = false should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall = handleRequest(method = HttpMethod.Post, uri = "/registration") {
                addHeader(HttpHeaders.ContentType, "application/json")
                setBody(
                    """
                   { "email": "test_test.com",
                     "firstName": "Navn",
                     "lastName": "Navnesen",
                     "degree": "DTEK",
                     "degreeYear": 3,
                     "slug": "bedpres-med-noen",
                     "terms": false
                   }
                   """.trimIndent()
                )
            }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
        }
    }

    "DELETE request on /registration with wrong Authorization header should return UNAUTHORIZED" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall = handleRequest(method = HttpMethod.Delete, uri = "/registration") {
                addHeader(HttpHeaders.ContentType, "application/json")
                addHeader(HttpHeaders.Authorization, "feil auth header")
                setBody("""{ "slug": "bedpres-med-noen", "email": "test@test.com" }""")
            }

            testCall.response.status() shouldBe HttpStatusCode.Unauthorized
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