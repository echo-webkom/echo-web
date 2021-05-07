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
    val exampleReg = RegistrationJson(
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
            val regs = listOf(
                Pair(Degree.DTEK, 2),
                Pair(Degree.INF, 4),
                Pair(Degree.ARMNINF, 1),
                Pair(Degree.KOGNI, 3)
            )

            for ((index, reg) in regs.withIndex()) {
                val submitRegCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(
                            gson.toJson(
                                exampleReg.copy(
                                    degree = reg.first,
                                    degreeYear = reg.second,
                                    email = "test${index}@test.com"
                                )
                            )
                        )
                    }

                submitRegCall.response.status() shouldBe HttpStatusCode.OK
                val res = gson.fromJson(submitRegCall.response.content, ResponseJson::class.java)
                res.code shouldBe Response.OK
                res.title shouldBe "Påmeldingen din er registrert!"
                res.desc shouldBe ""
            }
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
                    setBody(gson.toJson(exampleReg))
                }

            submitRegCall.response.status() shouldBe HttpStatusCode.OK
            val res = gson.fromJson(submitRegCall.response.content, ResponseJson::class.java)
            res.code shouldBe Response.OK
            res.title shouldBe "Påmeldingen din er registrert!"
            res.desc shouldBe ""

            val submitRegAgainCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    setBody(gson.toJson(exampleReg))
                }

            submitRegAgainCall.response.status() shouldBe HttpStatusCode.UnprocessableEntity
            val resAgain = gson.fromJson(submitRegAgainCall.response.content, ResponseJson::class.java)
            resAgain.code shouldBe Response.AlreadySubmitted
            resAgain.title shouldBe "Du er allerede påmeldt."
            resAgain.desc shouldBe "Du kan ikke melde deg på flere ganger."
        }
    }

    "POST request on /${Routing.registrationRoute} with invalid email should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    val invalidEmail = exampleReg.copy(email = "test_test.com")
                    setBody(gson.toJson(invalidEmail))
                }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
            val res = gson.fromJson(testCall.response.content, ResponseJson::class.java)
            res.code shouldBe Response.InvalidEmail
            res.title shouldBe "Vennligst skriv inn en gyldig mail."
            res.desc shouldBe ""
        }
    }

    "POST request on /${Routing.registrationRoute} with degree year smaller than 1 should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    val invalidDegreeYear = exampleReg.copy(degreeYear = 0)
                    setBody(gson.toJson(invalidDegreeYear))
                }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
            val res = gson.fromJson(testCall.response.content, ResponseJson::class.java)
            res.code shouldBe Response.InvalidDegreeYear
            res.title shouldBe "Vennligst velgt et gyldig trinn."
            res.desc shouldBe ""
        }
    }

    "POST request on /${Routing.registrationRoute} with degree year larger than 5 should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    val invalidDegreeYear = exampleReg.copy(degreeYear = 6)
                    setBody(gson.toJson(invalidDegreeYear))
                }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
            val res = gson.fromJson(testCall.response.content, ResponseJson::class.java)
            res.code shouldBe Response.InvalidDegreeYear
            res.title shouldBe "Vennligst velgt et gyldig trinn."
            res.desc shouldBe ""
        }
    }


    "POST request on /${Routing.registrationRoute} with degree year larger than 3 and a Degree corresponding to a bachelors degree should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val bachelorDegrees =
                listOf(
                    Degree.DTEK,
                    Degree.DSIK,
                    Degree.DVIT,
                    Degree.BINF,
                    Degree.IMO,
                    Degree.IKT,
                )

            for (deg in bachelorDegrees) {
                for (year in 4..5) {
                    val testCall: TestApplicationCall =
                        handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                            addHeader(HttpHeaders.ContentType, "application/json")
                            val invalidDegreeYear = exampleReg.copy(degreeYear = year, degree = deg)
                            setBody(gson.toJson(invalidDegreeYear))
                        }

                    testCall.response.status() shouldBe HttpStatusCode.BadRequest
                    val res = gson.fromJson(testCall.response.content, ResponseJson::class.java)
                    res.title shouldBe "Studieretning og årstrinn stemmer ikke overens."
                    res.desc shouldBe "Vennligst prøv igjen."
                }
            }
        }
    }

    "POST request on /${Routing.registrationRoute} with degree year not equal to 4 or 5 and a degree corresponding to a masters degree should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            for (i in 1..3) {
                val testCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        val invalidDegreeYear = exampleReg.copy(degreeYear = i, degree = Degree.INF)
                        setBody(gson.toJson(invalidDegreeYear))
                    }

                testCall.response.status() shouldBe HttpStatusCode.BadRequest
                val res = gson.fromJson(testCall.response.content, ResponseJson::class.java)
                res.code shouldBe Response.DegreeMismatchMaster
                res.title shouldBe "Studieretning og årstrinn stemmer ikke overens."
                res.desc shouldBe "Vennligst prøv igjen."
            }

            for (i in 1..3) {
                val testCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        val invalidDegreeYear = exampleReg.copy(degreeYear = i, degree = Degree.PROG)
                        setBody(gson.toJson(invalidDegreeYear))
                    }

                testCall.response.status() shouldBe HttpStatusCode.BadRequest
                val res = gson.fromJson(testCall.response.content, ResponseJson::class.java)
                res.code shouldBe Response.DegreeMismatchMaster
                res.title shouldBe "Studieretning og årstrinn stemmer ikke overens."
                res.desc shouldBe "Vennligst prøv igjen."
            }
        }
    }

    "POST request on /${Routing.registrationRoute} with degree equal to KOGNI and degree year not equal to 3 should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    val invalidDegreeYear = exampleReg.copy(degreeYear = 2, degree = Degree.KOGNI)
                    setBody(gson.toJson(invalidDegreeYear))
                }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
            val res = gson.fromJson(testCall.response.content, ResponseJson::class.java)
            res.code shouldBe Response.DegreeMismatchKogni
            res.title shouldBe "Studieretning og årstrinn stemmer ikke overens."
            res.desc shouldBe "Vennligst prøv igjen."
        }
    }

    "POST request on /${Routing.registrationRoute} with degree equal to ARMNINF and degree year not equal to 1 should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    val invalidDegreeYear = exampleReg.copy(degreeYear = 2, degree = Degree.ARMNINF)
                    setBody(gson.toJson(invalidDegreeYear))
                }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
            val res = gson.fromJson(testCall.response.content, ResponseJson::class.java)
            res.code shouldBe Response.DegreeMismatchArmninf
            res.title shouldBe "Studieretning og årstrinn stemmer ikke overens."
            res.desc shouldBe "Vennligst prøv igjen."
        }
    }

    "POST request on /${Routing.registrationRoute} with terms = false should return BAD_REQUEST" {
        withTestApplication({
            configureRouting("secret")
        }) {
            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    val invalidTerms = exampleReg.copy(terms = false)
                    setBody(gson.toJson(invalidTerms))
                }

            testCall.response.status() shouldBe HttpStatusCode.BadRequest
            val res = gson.fromJson(testCall.response.content, ResponseJson::class.java)
            res.code shouldBe Response.InvalidTerms
            res.title shouldBe "Du må godkjenne Bedkom sine retningslinjer."
            res.desc shouldBe "Vennligst prøv igjen."
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
                    setBody(gson.toJson(exampleReg))
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
            for (i in 1..5) {
                val submitRegCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(gson.toJson(exampleReg.copy(email = "tesadasdt${i}@test.com")))
                    }

                submitRegCall.response.status() shouldBe HttpStatusCode.OK
                val res = gson.fromJson(submitRegCall.response.content, ResponseJson::class.java)
                res.code shouldBe Response.OK
                res.title shouldBe "Påmeldingen din er registrert!"
                res.desc shouldBe ""
            }

            for (i in 1..2) {
                val submitRegWaitlistCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(gson.toJson(exampleReg.copy(email = "takadhasdh${i}@test.com")))
                    }

                submitRegWaitlistCall.response.status() shouldBe HttpStatusCode.Accepted
                val res = gson.fromJson(submitRegWaitlistCall.response.content, ResponseJson::class.java)
                res.code shouldBe Response.WaitList
                res.title shouldBe "Plassene er dessverre fylt opp..."
                res.desc shouldBe "Du har blitt satt på venteliste."
            }
        }
    }

    "POST request on ${Routing.registrationRoute} returns TOO_MANY_REQUESTS after 200 requests in under two minutes." {
        withTestApplication({
            configureRouting("secret")
        }) {
            for (i in 1..200) {
                val submitRegCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(
                            gson.toJson(
                                exampleReg.copy(
                                    email = "tajajaesadasdt${i}@test.com",
                                    degree = Degree.PROG,
                                    degreeYear = 1
                                )
                            )
                        )
                    }

                submitRegCall.response.status() shouldBe HttpStatusCode.BadRequest
                val res = gson.fromJson(submitRegCall.response.content, ResponseJson::class.java)
                res.code shouldBe Response.DegreeMismatchMaster
                res.title shouldBe "Studieretning og årstrinn stemmer ikke overens."
                res.desc shouldBe "Vennligst prøv igjen."
            }

            for (i in 1..10) {
                val submitRegCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(
                            gson.toJson(
                                exampleReg.copy(
                                    email = "tajajaesadasdt${i}@test.com",
                                    degree = Degree.PROG,
                                    degreeYear = 1
                                )
                            )
                        )
                    }

                submitRegCall.response.status() shouldBe HttpStatusCode.TooManyRequests
            }
        }
    }
})