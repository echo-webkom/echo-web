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
import no.uib.echo.schema.*
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.Base64

class RegistrationTest : StringSpec({
    val exampleBedpres1 = BedpresJson("bedpres-med-noen", 50, "2020-04-29T20:43:29Z")
    val exampleBedpres2 = BedpresJson("bedpres-med-noen-andre", 40, "2019-07-29T20:10:11Z")
    val exampleBedpres3 = BedpresJson("bedpres-dritlang-i-fremtiden", 40, "2037-07-29T20:10:11Z")
    val exampleReg = RegistrationJson(
        "test1@test.com", "Én", "Navnesen", Degree.DTEK, 3, exampleBedpres1.slug, true, null, false,
        listOf(AnswerJson("Skal du ha mat?", "Nei"), AnswerJson("Har du noen allergier?", "Ja masse allergier ass 100"))
    )

    val gson = Gson()

    val bedkom = "bedkom"
    val keys = mapOf(
        bedkom to "bedkom-passord"
    )

    beforeSpec { Db.init() }
    beforeTest {
        transaction {
            addLogger(StdOutSqlLogger)

            SchemaUtils.drop(Registration, Answer, Bedpres)
            SchemaUtils.create(Registration, Answer, Bedpres)
            insertOrUpdateBedpres(exampleBedpres1)
            insertOrUpdateBedpres(exampleBedpres2)
            insertOrUpdateBedpres(exampleBedpres3)
        }
    }

    "Trying to get registrations with wrong Authorization header should not work." {
        withTestApplication({
            configureRouting(keys)
        }) {
            val wrongAuth = "$bedkom:damn-feil-passord-100"

            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Put, uri = "/${Routing.bedpresRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    addHeader(
                        HttpHeaders.Authorization,
                        "Basic ${Base64.getEncoder().encodeToString(wrongAuth.toByteArray())}"
                    )
                }

            testCall.response.status() shouldBe HttpStatusCode.Unauthorized
        }
    }

    "Registrations with valid data should submit correctly." {
        withTestApplication({
            configureRouting(keys)
        }) {
            fun submitReg(degree: Degree, degreeYear: Int) {
                val submitRegCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(
                            gson.toJson(
                                exampleReg.copy(
                                    degree = degree,
                                    degreeYear = degreeYear,
                                    email = "test${degree}${degreeYear}@test.com"
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

            for (b in bachelors) {
                for (y in 1..3) {
                    submitReg(b, y)
                }
            }

            for (m in masters) {
                for (y in 4..5) {
                    submitReg(m, y)
                }
            }

            submitReg(Degree.KOGNI, 3)
            submitReg(Degree.ARMNINF, 1)
        }
    }

    "The same user should be able to sign up for two different bedpres's." {
        withTestApplication({
            configureRouting(keys)
        }) {
            for (b in listOf(exampleBedpres1, exampleBedpres2)) {
                val submitRegCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(gson.toJson(exampleReg.copy(slug = b.slug)))
                    }

                submitRegCall.response.status() shouldBe HttpStatusCode.OK
                val res = gson.fromJson(submitRegCall.response.content, ResponseJson::class.java)
                res.code shouldBe Response.OK
                res.title shouldBe "Påmeldingen din er registrert!"
                res.desc shouldBe ""
            }
        }
    }

    "Registration with valid data and empty question list should submit correctly." {
        withTestApplication({
            configureRouting(keys)
        }) {

            val submitRegCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    setBody(gson.toJson(exampleReg.copy(answers = emptyList())))
                }

            submitRegCall.response.status() shouldBe HttpStatusCode.OK
            val res = gson.fromJson(submitRegCall.response.content, ResponseJson::class.java)
            res.code shouldBe Response.OK
            res.title shouldBe "Påmeldingen din er registrert!"
            res.desc shouldBe ""
        }
    }

    "You should not be able to sign up for a bedpres more than once." {
        withTestApplication({
            configureRouting(keys)
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

    "You should not be able to sign up for a bedpres before the registration date." {
        withTestApplication({
            configureRouting(keys)
        }) {
            val submitRegCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    setBody(gson.toJson(exampleReg.copy(slug = exampleBedpres3.slug)))
                }

            submitRegCall.response.status() shouldBe HttpStatusCode.Forbidden
            val res = gson.fromJson(submitRegCall.response.content, ResponseJson::class.java)
            res.code shouldBe Response.TooEarly
            res.title shouldBe "Påmeldingen er ikke åpen enda."
            res.desc shouldBe "Vennligst vent."
        }
    }

    "You should not be able to sign up for a bedpres that doesn't exist." {
        withTestApplication({
            configureRouting(keys)
        }) {
            val submitRegCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    setBody(gson.toJson(exampleReg.copy(slug = "ikke-eksisterende-bedpres-som-ikke-finnes")))
                }

            submitRegCall.response.status() shouldBe HttpStatusCode.Conflict
            val res = gson.fromJson(submitRegCall.response.content, ResponseJson::class.java)
            res.code shouldBe Response.BedpresDosntExist
            res.title shouldBe "Denne bedpres'en finnes ikke."
            res.desc shouldBe "Om du mener dette ikke stemmer, ta kontakt med Webkom."
        }
    }

    "Email should contain @-sign." {
        withTestApplication({
            configureRouting(keys)
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

    "Degree year should not be smaller than one." {
        withTestApplication({
            configureRouting(keys)
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

    "Degree year should not be bigger than five." {
        withTestApplication({
            configureRouting(keys)
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


    "If the degree year is either four or five, the degree should not correspond to a bachelors degree." {
        withTestApplication({
            configureRouting(keys)
        }) {
            listOf(
                Degree.DTEK,
                Degree.DSIK,
                Degree.DVIT,
                Degree.BINF,
                Degree.IMO,
                Degree.IKT,
            ).map { deg ->
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

    "If the degree year is between one and three, the degree should not correspond to a masters degree." {
        withTestApplication({
            configureRouting(keys)
        }) {
            listOf(Degree.INF, Degree.PROG).map { deg ->
                for (i in 1..3) {
                    val testCall: TestApplicationCall =
                        handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                            addHeader(HttpHeaders.ContentType, "application/json")
                            val invalidDegreeYear = exampleReg.copy(degreeYear = i, degree = deg)
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
    }

    "If degree is KOGNI, degree year should be equal to three." {
        withTestApplication({
            configureRouting(keys)
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

    "If degree is ARMNINF, degree year should be equal to one." {
        withTestApplication({
            configureRouting(keys)
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

    "Terms should be accepted." {
        withTestApplication({
            configureRouting(keys)
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

    "Trying to delete a registration with wrong Authorization header should not work." {
        withTestApplication({
            configureRouting(keys)
        }) {
            val wrongAuth = "$bedkom:feil-passord-100-bruh"
            val testCall: TestApplicationCall =
                handleRequest(method = HttpMethod.Delete, uri = "/${Routing.registrationRoute}") {
                    addHeader(HttpHeaders.ContentType, "application/json")
                    addHeader(
                        HttpHeaders.Authorization,
                        "Basic ${Base64.getEncoder().encodeToString(wrongAuth.toByteArray())}"
                    )
                    setBody(gson.toJson(exampleReg))
                }

            testCall.response.status() shouldBe HttpStatusCode.Unauthorized
        }
    }

    "If a bedpres has filled up every spot, a registration should be put on the wait list." {
        withTestApplication({
            configureRouting(keys)
        }) {
            for (i in 1..(exampleBedpres1.spots)) {
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

            for (i in 1..3) {
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

    "Rate limit should work as expected." {
        withTestApplication({
            configureRouting(keys)
        }) {
            for (i in 1..200) {
                val submitRegCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(
                            gson.toJson(
                                exampleReg.copy(
                                    email = "ta123t${i}@test.com",
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

            for (i in 1..5) {
                val submitRegCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(
                            gson.toJson(
                                exampleReg.copy(
                                    email = "jn12sdpp3t${i}@test.xyz",
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
