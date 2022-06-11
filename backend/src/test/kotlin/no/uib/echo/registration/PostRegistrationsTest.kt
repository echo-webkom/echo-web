package no.uib.echo.registration

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.ktor.client.call.body
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.testing.testApplication
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import no.uib.echo.RegistrationResponse
import no.uib.echo.RegistrationResponseJson
import no.uib.echo.be
import no.uib.echo.exReg
import no.uib.echo.hap1
import no.uib.echo.hap10
import no.uib.echo.hap2
import no.uib.echo.hap3
import no.uib.echo.hap4
import no.uib.echo.hap5
import no.uib.echo.hap6
import no.uib.echo.hap7
import no.uib.echo.hap8
import no.uib.echo.hap9
import no.uib.echo.module
import no.uib.echo.schema.Answer
import no.uib.echo.schema.Degree
import no.uib.echo.schema.Happening
import no.uib.echo.schema.Registration
import no.uib.echo.schema.SpotRange
import no.uib.echo.schema.bachelors
import no.uib.echo.schema.insertOrUpdateHappening
import no.uib.echo.schema.masters
import no.uib.echo.schema.removeSlug
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction

class PostRegistrationsTest : StringSpec({
    beforeSpec {
        for (t in be) {
            insertOrUpdateHappening(removeSlug(hap1(t)), hap1(t).slug, null, sendEmail = false, dev = true)
            insertOrUpdateHappening(removeSlug(hap2(t)), hap2(t).slug, null, sendEmail = false, dev = true)
            insertOrUpdateHappening(removeSlug(hap3(t)), hap3(t).slug, null, sendEmail = false, dev = true)
            insertOrUpdateHappening(removeSlug(hap4(t)), hap4(t).slug, null, sendEmail = false, dev = true)
            insertOrUpdateHappening(removeSlug(hap5(t)), hap5(t).slug, null, sendEmail = false, dev = true)
            insertOrUpdateHappening(removeSlug(hap6(t)), hap6(t).slug, null, sendEmail = false, dev = true)
            insertOrUpdateHappening(removeSlug(hap7(t)), hap7(t).slug, null, sendEmail = false, dev = true)
            insertOrUpdateHappening(removeSlug(hap8(t)), hap8(t).slug, null, sendEmail = false, dev = true)
            insertOrUpdateHappening(removeSlug(hap9(t)), hap9(t).slug, null, sendEmail = false, dev = true)
            insertOrUpdateHappening(removeSlug(hap10(t)), hap10(t).slug, null, sendEmail = false, dev = true)
        }
    }

    beforeTest {
        transaction {
            SchemaUtils.drop(
                Happening, SpotRange, Registration, Answer
            )
            SchemaUtils.create(
                Happening, SpotRange, Registration, Answer
            )
        }
    }

    "Registrations with valid data should submit correctly." {
        testApplication {
            application {
                module()
            }

            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
            }

            for (t in be) {
                for (b in bachelors) {
                    for (y in 1..3) {
                        val submitRegCall = client.post("/happening/${hap1(t).slug}/registrations") {
                            contentType(ContentType.Application.Json)
                            setBody(
                                Json.encodeToString(
                                    exReg(t).copy(
                                        degree = b, degreeYear = y, email = "${t}test${b}$y@test.com"
                                    )
                                )
                            )
                        }
                        submitRegCall.status shouldBe HttpStatusCode.OK
                        val res: RegistrationResponseJson = submitRegCall.body()

                        res shouldNotBe null
                        res.code shouldBe RegistrationResponse.OK
                    }
                }

                for (m in masters) {
                    for (y in 4..5) {
                        val submitRegCall = client.post("/happening/${hap1(t).slug}/registrations") {
                            contentType(ContentType.Application.Json)
                            setBody(
                                Json.encodeToString(
                                    exReg(t).copy(
                                        degree = m, degreeYear = y, email = "${t}test${m}$y@test.com"
                                    )
                                )
                            )
                        }
                        submitRegCall.status shouldBe HttpStatusCode.OK
                        val res: RegistrationResponseJson = submitRegCall.body()

                        res shouldNotBe null
                        res.code shouldBe RegistrationResponse.OK
                    }
                }
            }
        }
    }

    "The same user should be able to sign up for two different happenings." {
        testApplication {
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
            }

            for (t in be) {
                for (slug in listOf(hap1(t).slug, hap2(t).slug)) {
                    val submitRegCall = client.post("/happening/$slug/registrations") {
                        contentType(ContentType.Application.Json)
                        setBody(Json.encodeToString(exReg(t)))
                    }

                    submitRegCall.status shouldBe HttpStatusCode.OK
                    val res: RegistrationResponseJson = submitRegCall.body()

                    res shouldNotBe null
                    res.code shouldBe RegistrationResponse.OK
                }
            }
        }
    }

    "Registration with valid data and empty question list should submit correctly." {
        testApplication {
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
            }

            for (t in be) {
                val submitRegCall = client.post("/happening/${hap1(t).slug}/registrations") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(t).copy(answers = emptyList())))
                }

                submitRegCall.status shouldBe HttpStatusCode.OK
                val res: RegistrationResponseJson = submitRegCall.body()

                res shouldNotBe null
                res.code shouldBe RegistrationResponse.OK
            }
        }
    }

    "You should not be able to sign up for a happening more than once." {
        testApplication {
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
            }

            for (t in be) {
                val submitRegCall = client.post("/happening/${hap1(t).slug}/registrations") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(t)))
                }

                submitRegCall.status shouldBe HttpStatusCode.OK
                val res: RegistrationResponseJson = submitRegCall.body()

                res shouldNotBe null
                res.code shouldBe RegistrationResponse.OK

                val submitRegAgainCall = client.post("/happening/${hap1(t).slug}/registrations") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(t)))
                }

                submitRegAgainCall.status shouldBe HttpStatusCode.UnprocessableEntity
                val resAgain: RegistrationResponseJson = submitRegAgainCall.body()

                resAgain shouldNotBe null
                resAgain.code shouldBe RegistrationResponse.AlreadySubmitted
            }
        }
    }

    "You should not be able to sign up for a happening more than once (wait list)." {
        testApplication {
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
            }

            for (t in be) {
                val fillUpRegsCall = client.post("/happening/${hap8(t).slug}/registrations") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(t)))
                }

                fillUpRegsCall.status shouldBe HttpStatusCode.OK
                val fillUpRes: RegistrationResponseJson = fillUpRegsCall.body()

                fillUpRes shouldNotBe null
                fillUpRes.code shouldBe RegistrationResponse.OK

                val newEmail = "bruh@moment.com"
                val submitRegCall = client.post("/happening/${hap8(t).slug}/registrations") {
                    contentType(ContentType.Application.Json)
                    setBody(
                        Json.encodeToString(
                            exReg(t).copy(
                                email = newEmail
                            )
                        )
                    )
                }

                submitRegCall.status shouldBe HttpStatusCode.Accepted
                val res: RegistrationResponseJson = submitRegCall.body()

                res shouldNotBe null
                res.code shouldBe RegistrationResponse.WaitList

                val submitRegAgainCall = client.post("/happening/${hap8(t).slug}/registrations") {
                    contentType(ContentType.Application.Json)
                    setBody(
                        Json.encodeToString(
                            exReg(t).copy(
                                email = newEmail
                            )
                        )
                    )
                }

                submitRegAgainCall.status shouldBe HttpStatusCode.UnprocessableEntity
                val resAgain: RegistrationResponseJson = submitRegAgainCall.body()

                resAgain shouldNotBe null
                resAgain.code shouldBe RegistrationResponse.AlreadySubmittedWaitList
            }
        }
    }

    "You should not be able to sign up for a happening before the registration date." {
        testApplication {
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
            }

            for (t in be) {
                val submitRegCall = client.post("/happening/${hap3(t).slug}/registrations") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(t)))
                }

                submitRegCall.status shouldBe HttpStatusCode.Forbidden
                val res: RegistrationResponseJson = submitRegCall.body()

                res shouldNotBe null
                res.code shouldBe RegistrationResponse.TooEarly
            }
        }
    }

    "You should not be able to sign up for a happening after the happening date." {
        testApplication {
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
            }

            for (t in be) {
                val submitRegCall = client.post("/happening/${hap10(t).slug}/registrations") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(t)))
                }

                submitRegCall.status shouldBe HttpStatusCode.Forbidden
                val res: RegistrationResponseJson = submitRegCall.body()

                res shouldNotBe null
                res.code shouldBe RegistrationResponse.TooLate
            }
        }
    }

    "You should not be able to sign up for a happening that doesn't exist." {
        testApplication {
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
            }

            for (t in be) {
                val submitRegCall =
                    client.post("/happening/ikke-eksisterende-happening-som-ikke-finnes/registrations") {
                        contentType(ContentType.Application.Json)
                        setBody(Json.encodeToString(exReg(t)))
                    }

                submitRegCall.status shouldBe HttpStatusCode.Conflict
                val res: RegistrationResponseJson = submitRegCall.body()

                res shouldNotBe null
                res.code shouldBe RegistrationResponse.HappeningDoesntExist
            }
        }
    }

    "Email should be valid." {
        testApplication {
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
            }

            val emails = listOf(
                Pair("test@test", false),
                Pair("test@test.", false),
                Pair("test_test.com", false),
                Pair("@test.com", false),
                Pair("test@uib.no", true),
                Pair("test@student.uib.no", true),
                Pair("test_person@hotmail.com", true),
                Pair("ola.nordmann@echo.uib.no", true)
            )

            for (t in be) {
                for ((email, isValid) in emails) {
                    val testCall = client.post("/happening/${hap1(t).slug}/registrations") {
                        contentType(ContentType.Application.Json)
                        setBody(Json.encodeToString(exReg(t).copy(email = email)))
                    }

                    if (isValid) testCall.status shouldBe HttpStatusCode.OK
                    else testCall.status shouldBe HttpStatusCode.BadRequest

                    val res: RegistrationResponseJson = testCall.body()
                    res shouldNotBe null

                    if (isValid) res.code shouldBe RegistrationResponse.OK
                    else res.code shouldBe RegistrationResponse.InvalidEmail
                }
            }
        }
    }

    "Degree year should not be smaller than one." {
        testApplication {
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
            }

            for (t in be) {
                val testCall = client.post("/happening/${hap1(t).slug}/registrations") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(t).copy(degreeYear = 0)))
                }

                testCall.status shouldBe HttpStatusCode.BadRequest
                val res: RegistrationResponseJson = testCall.body()

                res shouldNotBe null
                res.code shouldBe RegistrationResponse.InvalidDegreeYear
            }
        }
    }

    "Degree year should not be bigger than five." {
        testApplication {
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
            }

            for (t in be) {
                val testCall = client.post("/happening/${hap1(t).slug}/registrations") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(t).copy(degreeYear = 6)))
                }

                testCall.status shouldBe HttpStatusCode.BadRequest
                val res: RegistrationResponseJson = testCall.body()

                res shouldNotBe null
                res.code shouldBe RegistrationResponse.InvalidDegreeYear
            }
        }
    }

    "If the degree year is either four or five, the degree should not correspond to a bachelors degree." {
        testApplication {
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
            }

            listOf(
                Degree.DTEK,
                Degree.DSIK,
                Degree.DVIT,
                Degree.BINF,
                Degree.IMO,
            ).map { deg ->
                for (t in be) {
                    for (year in 4..5) {
                        val testCall = client.post("/happening/${hap1(t).slug}/registrations") {
                            contentType(ContentType.Application.Json)
                            setBody(Json.encodeToString(exReg(t).copy(degreeYear = year, degree = deg)))
                        }

                        testCall.status shouldBe HttpStatusCode.BadRequest
                        val res: RegistrationResponseJson = testCall.body()

                        res shouldNotBe null
                        res.code shouldBe RegistrationResponse.DegreeMismatchBachelor
                    }
                }
            }
        }
    }

    "If the degree year is between one and three, the degree should not correspond to a masters degree." {
        testApplication {
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
            }

            listOf(Degree.INF, Degree.PROG).map { deg ->
                for (t in be) {
                    for (i in 1..3) {
                        val testCall = client.post("/happening/(${hap1(t).slug}/registrations") {
                            contentType(ContentType.Application.Json)
                            setBody(Json.encodeToString(exReg(t).copy(degreeYear = i, degree = deg)))
                        }

                        testCall.status shouldBe HttpStatusCode.BadRequest
                        val res: RegistrationResponseJson = testCall.body()

                        res shouldNotBe null
                        res.code shouldBe RegistrationResponse.DegreeMismatchMaster
                    }
                }
            }
        }
    }

    "If degree is ARMNINF, degree year should be equal to one." {
        testApplication {
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
            }

            for (t in be) {
                for (i in 2..5) {
                    val testCall = client.post("/happening/${hap1(t).slug}/registrations") {
                        contentType(ContentType.Application.Json)
                        setBody(Json.encodeToString(exReg(t).copy(degree = Degree.ARMNINF, degreeYear = i)))
                    }

                    testCall.status shouldBe HttpStatusCode.BadRequest
                    val res: RegistrationResponseJson = testCall.body()

                    res shouldNotBe null
                    res.code shouldBe RegistrationResponse.DegreeMismatchArmninf
                }
            }
        }
    }

    "Terms should be accepted." {
        testApplication {
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
            }

            for (t in be) {
                val testCall = client.post("/happening/${hap1(t).slug}/registrations") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(t).copy(terms = false)))
                }

                testCall.status shouldBe HttpStatusCode.BadRequest
                val res: RegistrationResponseJson = testCall.body()

                res shouldNotBe null
                res.code shouldBe RegistrationResponse.InvalidTerms
            }
        }
    }

    "If a happening has filled up every spot, a registration should be put on the wait list." {
        testApplication {
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
            }

            for (t in be) {
                for (i in 1..(hap1(t).spotRanges[0].spots)) {
                    val submitRegCall = client.post("/happening/${hap1(t).slug}/registrations") {
                        contentType(ContentType.Application.Json)
                        setBody(Json.encodeToString(exReg(t).copy(email = "tesadasdt$i@test.com")))
                    }

                    submitRegCall.status shouldBe HttpStatusCode.OK
                    val res: RegistrationResponseJson = submitRegCall.body()

                    res shouldNotBe null
                    res.code shouldBe RegistrationResponse.OK
                }

                for (i in 1..3) {
                    val submitRegWaitListCall = client.post("/happening/${hap1(t).slug}/registrations") {
                        contentType(ContentType.Application.Json)
                        setBody(Json.encodeToString(exReg(t).copy(email = "takadhasdh$i@test.com")))
                    }

                    submitRegWaitListCall.status shouldBe HttpStatusCode.Accepted
                    val res: RegistrationResponseJson = submitRegWaitListCall.body()

                    res shouldNotBe null
                    res.code shouldBe RegistrationResponse.WaitList
                }
            }
        }
    }

    "You should not be able to sign up for a happening if you are not inside the degree year range." {
        testApplication {
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
            }

            for (t in be) {
                for (i in 1..2) {
                    val submitRegCall = client.post("/happening/${hap5(t).slug}/registrations") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            Json.encodeToString(
                                exReg(t).copy(
                                    email = "teasds${i}t3t@test.com",
                                    degreeYear = i,
                                )
                            )
                        )
                    }

                    submitRegCall.status shouldBe HttpStatusCode.Forbidden
                    val res: RegistrationResponseJson = submitRegCall.body()

                    res shouldNotBe null
                    res.code shouldBe RegistrationResponse.NotInRange
                }

                for (i in 3..5) {
                    val submitRegCall = client.post("/happening/${hap4(t).slug}/registrations") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            Json.encodeToString(
                                exReg(t).copy(
                                    email = "tlsbreh100aasdlo0${i}t3t@test.com",
                                    degreeYear = i,
                                    degree = if (i > 3) Degree.INF else Degree.DTEK
                                )
                            )
                        )
                    }

                    submitRegCall.status shouldBe HttpStatusCode.Forbidden
                    val res: RegistrationResponseJson = submitRegCall.body()

                    res shouldNotBe null
                    res.code shouldBe RegistrationResponse.NotInRange
                }
            }
        }
    }

    "Should accept registrations for happening with infinite spots" {
        testApplication {
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
            }

            for (t in be) {
                for (i in 1..1000) {
                    val submitRegCall = client.post("/happening/${hap7(t).slug}/registrations") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            Json.encodeToString(
                                exReg(t).copy(
                                    email = "${t}test$i@test.com"
                                )
                            )
                        )
                    }

                    submitRegCall.status shouldBe HttpStatusCode.OK
                    val res: RegistrationResponseJson = submitRegCall.body()

                    res shouldNotBe null
                    res.code shouldBe RegistrationResponse.OK
                }
            }
        }
    }

    "Should only be able to sign in via form" {
        testApplication {
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
            }

            for (t in be) {
                val submitRegFailCall = client.post("/happening/${hap1(t).slug}/registrations") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(t)))
                }

                submitRegFailCall.status shouldBe HttpStatusCode.Unauthorized
                val resFail: RegistrationResponseJson = submitRegFailCall.body()

                resFail shouldNotBe null
                resFail.code shouldBe RegistrationResponse.NotViaForm

                val submitRegOkCall = client.post("/happening/${hap1(t).slug}/registrations") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(t).copy(regVerifyToken = hap1(t).slug)))
                }

                submitRegOkCall.status shouldBe HttpStatusCode.OK
                val resOk: RegistrationResponseJson = submitRegOkCall.body()

                resOk shouldNotBe null
                resOk.code shouldBe RegistrationResponse.OK
            }
        }
    }
})
