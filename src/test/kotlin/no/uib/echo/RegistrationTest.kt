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
import no.uib.echo.plugins.Routing
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.transactions.transaction

internal class RegistrationTest : StringSpec({
    val exampleBedpres = BedpresJson("bedpres-med-noen", 420, "2021-04-29T20:43:29Z")
    val exampleReg1 = RegistrationJson(
        "test1@test.com", "Én", "Navnesen", Degree.ÅRMNINF, 1, exampleBedpres.slug, true, "2021-01-29T20:11:11Z"
    )
    val exampleReg2 = RegistrationJson(
        "test2@test.com", "To", "Navnesen", Degree.BINF, 2, exampleBedpres.slug, true, "2021-09-30T20:18:11Z"
    )
    val exampleReg3 = RegistrationJson(
        "test3@test.com", "Tre", "Navnesen", Degree.DTEK, 3, exampleBedpres.slug, true, "2021-01-30T20:41:01Z"
    )
    val exampleReg4 = RegistrationJson(
        "test4@test.com", "Fire", "Navnesen", Degree.INF, 4, exampleBedpres.slug, true, "2022-02-30T20:08:21Z"
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

    "GET request on /${Routing.registrationRoute} with wrong Authorization header should return UNAUTHORIZED" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall = handleRequest(method = HttpMethod.Get, uri = "/${Routing.registrationRoute}") {
                addHeader(HttpHeaders.Authorization, "feil auth header")
            }

            testCall.response.status() shouldBe HttpStatusCode.Unauthorized
        }
    }

    """
        POST request on /${Routing.registrationRoute} with valid payload should insert the registration in the database,
        and a subsequent POST request on /${Routing.registrationRoute} with the same email as in the initial payload should return BAD_REQUEST."
    """ {
        withTestApplication({
            configureRouting("secret")
        }) {
            val submitRegCall: TestApplicationCall = handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                addHeader(HttpHeaders.ContentType, "application/json")
                setBody(regToJson(exampleReg1))
            }

            submitRegCall.response.status() shouldBe HttpStatusCode.OK

            val submitRegAgainCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = Routing.registrationRoute) {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    setBody(regToJson(exampleReg1))
                }

            submitRegAgainCall.response.status() shouldBe HttpStatusCode.BadRequest
        }
    }
    "POST request on /${Routing.registrationRoute} with invalid email should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall = handleRequest(method = HttpMethod.Post, uri = "/registration") {
                addHeader(HttpHeaders.ContentType, "application/json")
                val invalidEmail = exampleReg1.copy(email = "test_test.com")
                setBody(regToJson(invalidEmail))
            }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
        }
    }

    "POST request on /${Routing.registrationRoute} with degree year smaller than 1 should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall = handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                addHeader(HttpHeaders.ContentType, "application/json")
                val invalidDegreeYear = exampleReg1.copy(degreeYear = 0)
                setBody(regToJson(invalidDegreeYear))
            }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
        }
    }

    "POST request on /${Routing.registrationRoute} with degree year larger than 5 should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall = handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                addHeader(HttpHeaders.ContentType, "application/json")
                val invalidDegreeYear = exampleReg1.copy(degreeYear = 6)
                setBody(regToJson(invalidDegreeYear))
            }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
        }
    }

    "POST request on /${Routing.registrationRoute} with terms = false should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall = handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                addHeader(HttpHeaders.ContentType, "application/json")
                val invalidDegreeYear = exampleReg1.copy(terms = false)
                setBody(regToJson(invalidDegreeYear))
            }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
        }
    }

    "DELETE request on /${Routing.registrationRoute} with wrong Authorization header should return UNAUTHORIZED" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall = handleRequest(method = HttpMethod.Delete, uri = "/${Routing.registrationRoute}") {
                addHeader(HttpHeaders.ContentType, "application/json")
                addHeader(HttpHeaders.Authorization, "feil auth header")
                setBody("""{ "slug": "bedpres-med-noen", "email": "test@test.com" }""")
            }

            testCall.response.status() shouldBe HttpStatusCode.Unauthorized
        }
    }
})