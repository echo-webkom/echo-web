package no.uib.echo.registration

import io.kotest.matchers.shouldBe
import io.ktor.client.call.body
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.testing.testApplication
import java.net.URI
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
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
import no.uib.echo.schema.Degree
import no.uib.echo.schema.bachelors
import no.uib.echo.schema.insertOrUpdateHappening
import no.uib.echo.schema.masters
import kotlin.test.Test
import kotlin.test.BeforeTest
import kotlin.test.AfterTest
import no.uib.echo.DatabaseHandler
import no.uib.echo.Response
import no.uib.echo.ResponseJson
import no.uib.echo.schema.Answer
import no.uib.echo.schema.Feedback
import no.uib.echo.schema.HAPPENING_TYPE
import no.uib.echo.schema.Happening
import no.uib.echo.schema.Registration
import no.uib.echo.schema.SpotRange
import no.uib.echo.schema.StudentGroup
import no.uib.echo.schema.StudentGroupMembership
import no.uib.echo.schema.User
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.batchInsert
import org.jetbrains.exposed.sql.transactions.transaction

class PostRegistrationsTest {
    companion object {
        val db = DatabaseHandler(
            dev = true,
            testMigration = false,
            dbUrl = URI(System.getenv("DATABASE_URL")),
            mbMaxPoolSize = null
        )
    }

    @BeforeTest
    fun beforeTest() {
        db.init(false)
        for (t in be) {
            insertTestData(t)
        }
    }

    @AfterTest
    fun afterTest() {
        transaction {
            SchemaUtils.drop(
                Happening, Registration, Answer, SpotRange, User, Feedback, StudentGroup, StudentGroupMembership
            )
            SchemaUtils.create(
                Happening, Registration, Answer, SpotRange, User, Feedback, StudentGroup, StudentGroupMembership
            )
        }
    }

    @Test
    fun `Registrations with valid data should submit correctly`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                for (b in bachelors) {
                    for (y in 1..3) {
                        val submitRegCall = client.post("/registration") {
                            contentType(ContentType.Application.Json)
                            setBody(
                                Json.encodeToString(
                                    exReg(t, hap1(t).slug).copy(
                                        degree = b, degreeYear = y, email = "${t}test${b}$y@test.com"
                                    )
                                )
                            )
                        }
                        submitRegCall.status shouldBe HttpStatusCode.OK
                        val res: ResponseJson = submitRegCall.body()

                        res.code shouldBe Response.OK
                    }
                }

                for (m in masters) {
                    for (y in 4..5) {
                        val submitRegCall = client.post("/registration") {
                            contentType(ContentType.Application.Json)
                            setBody(
                                Json.encodeToString(
                                    exReg(t, hap1(t).slug).copy(
                                        degree = m, degreeYear = y, email = "${t}test${m}$y@test.com"
                                    )
                                )
                            )
                        }
                        submitRegCall.status shouldBe HttpStatusCode.OK
                        val res: ResponseJson = submitRegCall.body()

                        res.code shouldBe Response.OK
                    }
                }
            }
        }

    @Test
    fun `The same user should be able to sign up for two different happenings`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                for (slug in listOf(hap1(t).slug, hap2(t).slug)) {
                    val submitRegCall = client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        setBody(Json.encodeToString(exReg(t, slug)))
                    }

                    submitRegCall.status shouldBe HttpStatusCode.OK
                    val res: ResponseJson = submitRegCall.body()

                    res.code shouldBe Response.OK
                }
            }
        }

    @Test
    fun `Registration with valid data and empty question list should submit correctly`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                val submitRegCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(t, hap1(t).slug).copy(answers = emptyList())))
                }

                submitRegCall.status shouldBe HttpStatusCode.OK
                val res: ResponseJson = submitRegCall.body()

                res.code shouldBe Response.OK
            }
        }

    @Test
    fun `You should not be able to sign up for a happening more than once`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                val submitRegCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(t, hap1(t).slug)))
                }

                submitRegCall.status shouldBe HttpStatusCode.OK
                val res: ResponseJson = submitRegCall.body()

                res.code shouldBe Response.OK

                val submitRegAgainCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(t, hap1(t).slug)))
                }

                submitRegAgainCall.status shouldBe HttpStatusCode.UnprocessableEntity
                val resAgain: ResponseJson = submitRegAgainCall.body()

                resAgain.code shouldBe Response.AlreadySubmitted
            }
        }

    @Test
    fun `You should not be able to sign up for a happening more than once (wait list)`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                val fillUpRegsCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(t, hap8(t).slug)))
                }

                fillUpRegsCall.status shouldBe HttpStatusCode.OK
                val fillUpRes: ResponseJson = fillUpRegsCall.body()

                fillUpRes.code shouldBe Response.OK

                val newEmail = "bruh@moment.com"
                val submitRegCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    setBody(
                        Json.encodeToString(
                            exReg(t, hap8(t).slug).copy(
                                email = newEmail
                            )
                        )
                    )
                }

                submitRegCall.status shouldBe HttpStatusCode.Accepted
                val res: ResponseJson = submitRegCall.body()

                res.code shouldBe Response.WaitList

                val submitRegAgainCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    setBody(
                        Json.encodeToString(
                            exReg(t, hap8(t).slug).copy(
                                email = newEmail
                            )
                        )
                    )
                }

                submitRegAgainCall.status shouldBe HttpStatusCode.UnprocessableEntity
                val resAgain: ResponseJson = submitRegAgainCall.body()

                resAgain.code shouldBe Response.AlreadySubmittedWaitList
            }
        }

    @Test
    fun `You should not be able to sign up for a happening before the registration date`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                val submitRegCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(t, hap3(t).slug)))
                }

                submitRegCall.status shouldBe HttpStatusCode.Forbidden
                val res: ResponseJson = submitRegCall.body()

                res.code shouldBe Response.TooEarly
            }
        }

    @Test
    fun `You should not be able to sign up for a happening after the happening date`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                val submitRegCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(t, hap10(t).slug)))
                }

                submitRegCall.status shouldBe HttpStatusCode.Forbidden
                val res: ResponseJson = submitRegCall.body()

                res.code shouldBe Response.TooLate
            }
        }

    @Test
    fun `You should not be able to sign up for a happening that doesn't exist`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                val submitRegCall =
                    client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        setBody(Json.encodeToString(exReg(t, "ikke-eksisterence-happening-som-ikke-finnes-engang")))
                    }

                submitRegCall.status shouldBe HttpStatusCode.Conflict
                val res: ResponseJson = submitRegCall.body()

                res.code shouldBe Response.HappeningDoesntExist
            }
        }

    @Test
    fun `Email should be valid`() =
        testApplication {
            val client = createClient {
                install(Logging)
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
                    val testCall = client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        setBody(Json.encodeToString(exReg(t, hap1(t).slug).copy(email = email)))
                    }

                    if (isValid) testCall.status shouldBe HttpStatusCode.OK
                    else testCall.status shouldBe HttpStatusCode.BadRequest

                    val res: ResponseJson = testCall.body()

                    if (isValid) res.code shouldBe Response.OK
                    else res.code shouldBe Response.InvalidEmail
                }
            }
        }

    @Test
    fun `Degree year should not be smaller than one`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                val testCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(t, hap1(t).slug).copy(degreeYear = 0)))
                }

                testCall.status shouldBe HttpStatusCode.BadRequest
                val res: ResponseJson = testCall.body()

                res.code shouldBe Response.InvalidDegreeYear
            }
        }

    @Test
    fun `Degree year should not be bigger than five`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                val testCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(t, hap1(t).slug).copy(degreeYear = 6)))
                }

                testCall.status shouldBe HttpStatusCode.BadRequest
                val res: ResponseJson = testCall.body()

                res.code shouldBe Response.InvalidDegreeYear
            }
        }

    @Test
    fun `If the degree year is either four or five, the degree should not correspond to a bachelors degree`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                listOf(
                    Degree.DTEK,
                    Degree.DSIK,
                    Degree.DVIT,
                    Degree.BINF,
                    Degree.IMO,
                ).map { deg ->
                    for (year in 4..5) {
                        val testCall = client.post("/registration") {
                            contentType(ContentType.Application.Json)
                            setBody(Json.encodeToString(exReg(t, hap1(t).slug).copy(degreeYear = year, degree = deg)))
                        }

                        testCall.status shouldBe HttpStatusCode.BadRequest
                        val res: ResponseJson = testCall.body()

                        res.code shouldBe Response.DegreeMismatchBachelor
                    }
                }
            }
        }

    @Test
    fun `If the degree year is between one and three, the degree should not correspond to a masters degree`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                listOf(Degree.INF, Degree.PROG).map { deg ->
                    for (i in 1..3) {
                        val testCall = client.post("/registration") {
                            contentType(ContentType.Application.Json)
                            setBody(Json.encodeToString(exReg(t, hap1(t).slug).copy(degreeYear = i, degree = deg)))
                        }

                        testCall.status shouldBe HttpStatusCode.BadRequest
                        val res: ResponseJson = testCall.body()

                        res.code shouldBe Response.DegreeMismatchMaster
                    }
                }
            }
        }

    @Test
    fun `If degree is ARMNINF, degree year should be equal to one`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                for (i in 2..5) {
                    val testCall = client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            Json.encodeToString(
                                exReg(t, hap1(t).slug).copy(
                                    degree = Degree.ARMNINF,
                                    degreeYear = i
                                )
                            )
                        )
                    }

                    testCall.status shouldBe HttpStatusCode.BadRequest
                    val res: ResponseJson = testCall.body()

                    res.code shouldBe Response.DegreeMismatchArmninf
                }
            }
        }

    @Test
    fun `Terms should be accepted`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                val testCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(t, hap1(t).slug).copy(terms = false)))
                }

                testCall.status shouldBe HttpStatusCode.BadRequest
                val res: ResponseJson = testCall.body()

                res.code shouldBe Response.InvalidTerms
            }
        }

    @Test
    fun `If a happening has filled up every spot, a registration should be put on the wait list`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                for (i in 1..(hap1(t).spotRanges[0].spots)) {
                    val submitRegCall = client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        setBody(Json.encodeToString(exReg(t, hap1(t).slug).copy(email = "tesadasdt$i@test.com")))
                    }

                    submitRegCall.status shouldBe HttpStatusCode.OK
                    val res: ResponseJson = submitRegCall.body()

                    res.code shouldBe Response.OK
                }

                for (i in 1..3) {
                    val submitRegWaitListCall = client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        setBody(Json.encodeToString(exReg(t, hap1(t).slug).copy(email = "takadhasdh$i@test.com")))
                    }

                    submitRegWaitListCall.status shouldBe HttpStatusCode.Accepted
                    val res: ResponseJson = submitRegWaitListCall.body()

                    res.code shouldBe Response.WaitList
                }
            }
        }

    @Test
    fun `You should not be able to sign up for a happening if you are not inside the degree year range`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                for (i in 1..2) {
                    val submitRegCall = client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            Json.encodeToString(
                                exReg(t, hap5(t).slug).copy(
                                    email = "teasds${i}t3t@test.com",
                                    degreeYear = i,
                                )
                            )
                        )
                    }

                    submitRegCall.status shouldBe HttpStatusCode.Forbidden
                    val res: ResponseJson = submitRegCall.body()

                    res.code shouldBe Response.NotInRange
                }

                for (i in 3..5) {
                    val submitRegCall = client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            Json.encodeToString(
                                exReg(t, hap4(t).slug).copy(
                                    email = "tlsbreh100aasdlo0${i}t3t@test.com",
                                    degreeYear = i,
                                    degree = if (i > 3) Degree.INF else Degree.DTEK
                                )
                            )
                        )
                    }

                    submitRegCall.status shouldBe HttpStatusCode.Forbidden
                    val res: ResponseJson = submitRegCall.body()

                    res.code shouldBe Response.NotInRange
                }
            }
        }

    @Test
    fun `Should accept registrations for happening with infinite spots`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                for (i in 1..1000) {
                    val submitRegCall = client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            Json.encodeToString(
                                exReg(t, hap7(t).slug).copy(
                                    email = "${t}test$i@test.com"
                                )
                            )
                        )
                    }

                    submitRegCall.status shouldBe HttpStatusCode.OK
                    val res: ResponseJson = submitRegCall.body()

                    res.code shouldBe Response.OK
                }
            }
        }

    @Test
    fun `Should only be able to sign in via form`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                val submitRegFailCall = client.post("/registration?verify=true") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(t, hap1(t).slug)))
                }

                submitRegFailCall.status shouldBe HttpStatusCode.Unauthorized
                val resFail: ResponseJson = submitRegFailCall.body()

                resFail.code shouldBe Response.NotViaForm

                val submitRegOkCall = client.post("/registration?verify=true") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(t, hap1(t).slug).copy(regVerifyToken = hap1(t).slug)))
                }

                submitRegOkCall.status shouldBe HttpStatusCode.OK
                val resOk: ResponseJson = submitRegOkCall.body()

                resOk.code shouldBe Response.OK
            }
        }
}

private fun insertTestData(t: HAPPENING_TYPE) {
    transaction {
        addLogger(StdOutSqlLogger)

        StudentGroup.batchInsert(listOf("bedkom", "tilde"), ignore = true) {
            this[StudentGroup.name] = it
        }
    }
    insertOrUpdateHappening(hap1(t), dev = true)
    insertOrUpdateHappening(hap2(t), dev = true)
    insertOrUpdateHappening(hap3(t), dev = true)
    insertOrUpdateHappening(hap4(t), dev = true)
    insertOrUpdateHappening(hap5(t), dev = true)
    insertOrUpdateHappening(hap6(t), dev = true)
    insertOrUpdateHappening(hap7(t), dev = true)
    insertOrUpdateHappening(hap8(t), dev = true)
    insertOrUpdateHappening(hap9(t), dev = true)
    insertOrUpdateHappening(hap10(t), dev = true)
}
