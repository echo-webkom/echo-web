package no.uib.echo

import com.google.gson.Gson
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
    val exampleBedpres = BedpresJson("bedpres-med-noen", 5, "2020-04-29T20:43:29Z")
    val exampleReg1 = RegistrationJson(
        "test1@test.com", "Én", "Navnesen", Degree.DTEK, 3, exampleBedpres.slug, true, null, false
    )

    val gson = Gson()

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
                    setBody(gson.toJson(exampleReg1))
                }

            submitRegCall.response.status() shouldBe HttpStatusCode.OK
            val res = gson.fromJson(submitRegCall.response.content, ResponseJson::class.java)
            res.code shouldBe Response.OK
            res.msg shouldBe "Påmeldingen din er registrert!"

            val submitMasterRegCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    val validMaster = exampleReg1.copy(
                        degree = Degree.INF,
                        degreeYear = 4,
                        email = "masterboi@lol.com"
                    )
                    setBody(gson.toJson(validMaster))
                }

            submitMasterRegCall.response.status() shouldBe HttpStatusCode.OK
            val masterRes = gson.fromJson(submitMasterRegCall.response.content, ResponseJson::class.java)
            masterRes.code shouldBe Response.OK
            masterRes.msg shouldBe "Påmeldingen din er registrert!"

            val submitKogniRegCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    val validKogni = exampleReg1.copy(
                        degree = Degree.KOGNI,
                        degreeYear = 3,
                        email = "kogni@bruh.com"
                    )
                    setBody(gson.toJson(validKogni))
                }

            submitKogniRegCall.response.status() shouldBe HttpStatusCode.OK
            val kogniRes = gson.fromJson(submitKogniRegCall.response.content, ResponseJson::class.java)
            kogniRes.code shouldBe Response.OK
            kogniRes.msg shouldBe "Påmeldingen din er registrert!"

            val submitArmninfRegCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    val validArmninf = exampleReg1.copy(
                        degree = Degree.ARMNINF,
                        degreeYear = 1,
                        email = "årinfass@100.tk"
                    )
                    setBody(gson.toJson(validArmninf))
                }

            submitArmninfRegCall.response.status() shouldBe HttpStatusCode.OK
            val armninfRes = gson.fromJson(submitArmninfRegCall.response.content, ResponseJson::class.java)
            armninfRes.code shouldBe Response.OK
            armninfRes.msg shouldBe "Påmeldingen din er registrert!"
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
                    setBody(gson.toJson(exampleReg1))
                }

            submitRegCall.response.status() shouldBe HttpStatusCode.OK
            val res = gson.fromJson(submitRegCall.response.content, ResponseJson::class.java)
            res.code shouldBe Response.OK
            res.msg shouldBe "Påmeldingen din er registrert!"

            val submitRegAgainCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    setBody(gson.toJson(exampleReg1))
                }

            submitRegAgainCall.response.status() shouldBe HttpStatusCode.UnprocessableEntity
            val resAgain = gson.fromJson(submitRegAgainCall.response.content, ResponseJson::class.java)
            resAgain.code shouldBe Response.AlreadySubmitted
            resAgain.msg shouldBe "Du kan ikke melde deg på flere ganger."
        }
    }

    "POST request on /${Routing.registrationRoute} with invalid email should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    val invalidEmail = exampleReg1.copy(email = "test_test.com")
                    setBody(gson.toJson(invalidEmail))
                }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
            val res = gson.fromJson(testCall.response.content, ResponseJson::class.java)
            res.code shouldBe Response.InvalidEmail
            res.msg shouldBe "Vennligst skriv inn en gyldig mail."
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
                    setBody(gson.toJson(invalidDegreeYear))
                }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
            val res = gson.fromJson(testCall.response.content, ResponseJson::class.java)
            res.code shouldBe Response.InvalidDegreeYear
            res.msg shouldBe "Vennligst velgt et gyldig trinn."
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
                    setBody(gson.toJson(invalidDegreeYear))
                }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
            val res = gson.fromJson(testCall.response.content, ResponseJson::class.java)
            res.code shouldBe Response.InvalidDegreeYear
            res.msg shouldBe "Vennligst velgt et gyldig trinn."
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
                    setBody(gson.toJson(invalidDegreeYear))
                }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
            val res = gson.fromJson(testCall.response.content, ResponseJson::class.java)
            res.code shouldBe Response.DegreeMismatchBachelor
            res.msg shouldBe "Studieretning og årstrinn stemmer ikke overens."
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
                    setBody(gson.toJson(invalidDegreeYear))
                }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
            val res = gson.fromJson(testCall.response.content, ResponseJson::class.java)
            res.code shouldBe Response.DegreeMismatchMaster
            res.msg shouldBe "Studieretning og årstrinn stemmer ikke overens."
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
                    setBody(gson.toJson(invalidDegreeYear))
                }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
            val res = gson.fromJson(testCall.response.content, ResponseJson::class.java)
            res.code shouldBe Response.DegreeMismatchKogni
            res.msg shouldBe "Studieretning og årstrinn stemmer ikke overens."
        }
    }

    "POST request on /${Routing.registrationRoute} with degree equal to ARMNINF and degree year not equal to 1 should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    val invalidDegreeYear = exampleReg1.copy(degreeYear = 2, degree = Degree.ARMNINF)
                    setBody(gson.toJson(invalidDegreeYear))
                }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
            val res = gson.fromJson(testCall.response.content, ResponseJson::class.java)
            res.code shouldBe Response.DegreeMismatchArmninf
            res.msg shouldBe "Studieretning og årstrinn stemmer ikke overens."
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
                    setBody(gson.toJson(invalidTerms))
                }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
            val res = gson.fromJson(testCall.response.content, ResponseJson::class.java)
            res.code shouldBe Response.InvalidTerms
            res.msg shouldBe "Du må godkjenne Bedkom sine retningslinjer."
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
                    setBody(gson.toJson(exampleReg1))
                }

            testCall.response.status() shouldBe HttpStatusCode.Unauthorized
        }
    }

    """
    POST request on /${Routing.registrationRoute} with valid payloads should return OK for the first two requests,
    and ACCEPTED for the next request if the bedpres has two spots.
    """ {
        withTestApplication({
            configureRouting("secret")
        }) {
            for (i in 1..6) {
                val submitRegCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(gson.toJson(exampleReg1.copy(email = "test${i}@test.com")))
                    }

                submitRegCall.response.status() shouldBe HttpStatusCode.OK
                val res = gson.fromJson(submitRegCall.response.content, ResponseJson::class.java)
                res.code shouldBe Response.OK
                res.msg shouldBe "Påmeldingen din er registrert!"
            }

            for (i in 1..2) {
                val submitRegWaitlistCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(gson.toJson(exampleReg1.copy(email = "takadhasdh${i}@test.com")))
                    }

                submitRegWaitlistCall.response.status() shouldBe HttpStatusCode.Accepted
                val res = gson.fromJson(submitRegWaitlistCall.response.content, ResponseJson::class.java)
                res.code shouldBe Response.WaitList
                res.msg shouldBe "Plassene er fylt opp, men du har blitt satt på venteliste."
            }
        }
    }
})