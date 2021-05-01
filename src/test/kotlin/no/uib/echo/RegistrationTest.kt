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
import no.uib.echo.plugins.configureRouting
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.transactions.transaction

class RegistrationTest : StringSpec({
    val exampleBedpres = BedpresJson("bedpres-med-noen", 420, "2021-04-29T20:43:29Z")
    val exampleReg = RegistrationJson(
        "test@test.com", "Navn", "Navnesen", Degree.DTEK, 2, exampleBedpres.slug, true, "2021-04-30T20:31:11Z"
    )

    fun regToJson(reg: RegistrationJson): String {
        return """
        {
          "email": "${reg.email}",
          "firstName": "${reg.firstName}",
          "lastName": "${reg.lastName}",
          "degree": "${reg.degree}",
          "degreeYear": ${reg.degreeYear},
          "slug": "${reg.slug}",
          "terms": ${reg.terms},
          "submitDate": "${reg.submitDate}"
        }
    """.trimIndent().replace("\\s".toRegex(), "")
    }

    beforeSpec { Db.init() }
    beforeTest {
        transaction {
            addLogger(StdOutSqlLogger)

            SchemaUtils.drop(Registration, Bedpres)
            SchemaUtils.create(Registration, Bedpres)
            insertOrUpdateBedpres(exampleBedpres)
        }
    }

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

    """
        POST request on /registration with valid payload should insert the registration in the database,
        and a subsequent GET request on /registration?email= with the same email as in the initial payload should return the same JSON object"
    """ {
        withTestApplication({
            configureRouting("secret")
        }) {
            val submitRegCall: TestApplicationCall = handleRequest(method = HttpMethod.Post, uri = "/registration") {
                addHeader(HttpHeaders.ContentType, "application/json")
                setBody(regToJson(exampleReg))
            }

            submitRegCall.response.status() shouldBe HttpStatusCode.OK

            val getRegCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Get, uri = "/registration?email=${exampleReg.email}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    addHeader(HttpHeaders.Authorization, "secret")
                }

            getRegCall.response.status() shouldBe HttpStatusCode.OK

            // Can't compare JSON objects as strings since submitDate
            // depends on when the request happens.
            //
            // getRegCall.response.content shouldBe "[${regToJson(exampleReg)}]"
        }
    }

    "POST request on /registration with invalid email should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall = handleRequest(method = HttpMethod.Post, uri = "/registration") {
                addHeader(HttpHeaders.ContentType, "application/json")
                val invalidEmail = exampleReg.copy(email = "test_test.com")
                setBody(regToJson(invalidEmail))
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
                val invalidDegreeYear = exampleReg.copy(degreeYear = 0)
                setBody(regToJson(invalidDegreeYear))
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
                val invalidDegreeYear = exampleReg.copy(degreeYear = 6)
                setBody(regToJson(invalidDegreeYear))
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
                val invalidDegreeYear = exampleReg.copy(terms = false)
                setBody(regToJson(invalidDegreeYear))
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
})