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
import no.uib.echo.schema.Bedpres
import no.uib.echo.schema.BedpresJson
import no.uib.echo.schema.Degree
import no.uib.echo.schema.Registration
import no.uib.echo.schema.RegistrationJson
import no.uib.echo.schema.insertOrUpdateBedpres
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.transactions.transaction

class RegistrationTest : StringSpec({
    val exampleBedpres = BedpresJson("bedpres-med-noen", 420, "2021-04-29T20:43:29Z")
    val exampleReg1 = RegistrationJson(
        "test1@test.com", "Én", "Navnesen", Degree.DTEK, 3, exampleBedpres.slug, true, null
    )


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
            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Get, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.Authorization, "feil auth header")
                }

            testCall.response.status() shouldBe HttpStatusCode.Unauthorized
        }
    }


    "POST request on /${Routing.registrationRoute} with valid payloads should return OK." {
        withTestApplication({
            configureRouting("secret")
        }) {
            val submitRegCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    setBody(regToJson(exampleReg1))
                }

            submitRegCall.response.status() shouldBe HttpStatusCode.OK

            val submitMasterRegCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    val validMaster = exampleReg1.copy(
                        degree = Degree.INF,
                        degreeYear = 4,
                        email = "masterboi@lol.com"
                    )
                    setBody(regToJson(validMaster))
                }

            submitMasterRegCall.response.status() shouldBe HttpStatusCode.OK

            val submitKogniRegCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    val validKogni = exampleReg1.copy(
                        degree = Degree.KOGNI,
                        degreeYear = 3,
                        email = "kogni@bruh.com"
                    )
                    setBody(regToJson(validKogni))
                }

            submitKogniRegCall.response.status() shouldBe HttpStatusCode.OK

            val submitArmninfRegCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    val validArmninf = exampleReg1.copy(
                        degree = Degree.ÅRMNINF,
                        degreeYear = 1,
                        email = "årinfass@100.tk"
                    )
                    setBody(regToJson(validArmninf))
                }

            submitArmninfRegCall.response.status() shouldBe HttpStatusCode.OK
        }
    }

    """
        POST request on /${Routing.registrationRoute} with valid payload should insert the registration in the database,
        and a subsequent POST request on /${Routing.registrationRoute} with the same email as in the initial payload should return BAD_REQUEST."
    """ {
        withTestApplication({
            configureRouting("secret")
        }) {
            val submitRegCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    setBody(regToJson(exampleReg1))
                }

            submitRegCall.response.status() shouldBe HttpStatusCode.OK

            val submitRegAgainCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    setBody(regToJson(exampleReg1))
                }

            submitRegAgainCall.response.status() shouldBe HttpStatusCode.UnprocessableEntity
        }
    }

    "POST request on /${Routing.registrationRoute} with invalid email should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall = handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
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
            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
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
            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    val invalidDegreeYear = exampleReg1.copy(degreeYear = 6)
                    setBody(regToJson(invalidDegreeYear))
                }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
        }
    }


    "POST request on /${Routing.registrationRoute} with degree year larger than 3 and a Degree corresponding to a bachelors degree should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    val invalidDegreeYear = exampleReg1.copy(degreeYear = 4, degree = Degree.DVIT)
                    setBody(regToJson(invalidDegreeYear))
                }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
        }
    }

    "POST request on /${Routing.registrationRoute} with degree year not equal to 4 or 5 and a degree corresponding to a masters degree should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    val invalidDegreeYear = exampleReg1.copy(degreeYear = 3, degree = Degree.INF)
                    setBody(regToJson(invalidDegreeYear))
                }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
        }
    }

    "POST request on /${Routing.registrationRoute} with degree equal to KOGNI and degree year not equal to 3 should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    val invalidDegreeYear = exampleReg1.copy(degreeYear = 2, degree = Degree.KOGNI)
                    setBody(regToJson(invalidDegreeYear))
                }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
        }
    }

    "POST request on /${Routing.registrationRoute} with degree equal to ARMNINF and degree year not equal to 1 should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    val invalidDegreeYear = exampleReg1.copy(degreeYear = 2, degree = Degree.ÅRMNINF)
                    setBody(regToJson(invalidDegreeYear))
                }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
        }
    }

    "POST request on /${Routing.registrationRoute} with terms = false should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    val invalidTerms = exampleReg1.copy(terms = false)
                    setBody(regToJson(invalidTerms))
                }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
        }
    }

    "DELETE request on /${Routing.registrationRoute} with wrong Authorization header should return UNAUTHORIZED" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Delete, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    addHeader(HttpHeaders.Authorization, "feil auth header")
                    setBody(regToJson(exampleReg1))
                }

            testCall.response.status() shouldBe HttpStatusCode.Unauthorized
        }
    }
})

/**
 * USE ONLY FOR TESTS!
 */
fun regToJson(reg: RegistrationJson): String {
    return """
        {
          "email": "${reg.email}",
          "firstName": "${reg.firstName}",
          "lastName": "${reg.lastName}",
          "degree": "${reg.degree}",
          "degreeYear": ${reg.degreeYear},
          "slug": "${reg.slug}",
          "terms": ${reg.terms}
        }
    """.trimIndent().replace("\\s".toRegex(), "")
}
