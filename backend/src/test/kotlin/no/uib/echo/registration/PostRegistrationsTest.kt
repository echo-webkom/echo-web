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
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import no.uib.echo.DatabaseHandler
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
import no.uib.echo.schema.Answer
import no.uib.echo.schema.Feedback
import no.uib.echo.schema.HAPPENING_TYPE
import no.uib.echo.schema.Happening
import no.uib.echo.schema.Reaction
import no.uib.echo.schema.Registration
import no.uib.echo.schema.SpotRange
import no.uib.echo.schema.StudentGroup
import no.uib.echo.schema.StudentGroupMembership
import no.uib.echo.schema.User
import no.uib.echo.schema.insertOrUpdateHappening
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.batchInsert
import org.jetbrains.exposed.sql.transactions.transaction
import java.net.URI
import kotlin.test.AfterTest
import kotlin.test.BeforeTest
import kotlin.test.Test
import no.uib.echo.schema.validStudentGroups
import no.uib.echo.user1
import no.uib.echo.user2
import no.uib.echo.user3
import no.uib.echo.user4
import no.uib.echo.user5
import no.uib.echo.user6
import no.uib.echo.users

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
                Happening,
                Registration,
                Answer,
                SpotRange,
                User,
                Feedback,
                StudentGroup,
                StudentGroupMembership,
                Reaction
            )
            SchemaUtils.create(
                Happening,
                Registration,
                Answer,
                SpotRange,
                User,
                Feedback,
                StudentGroup,
                StudentGroupMembership,
                Reaction
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
                for (u in users) {
                    val submitRegCall = client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            Json.encodeToString(
                                exReg(hap1(t).slug, u)
                            )
                        )
                    }
                    submitRegCall.status shouldBe HttpStatusCode.OK
                    val res: RegistrationResponseJson = submitRegCall.body()

                    res.code shouldBe RegistrationResponse.OK
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
                        setBody(Json.encodeToString(exReg(slug, user1)))
                    }

                    submitRegCall.status shouldBe HttpStatusCode.OK
                    val res: RegistrationResponseJson = submitRegCall.body()

                    res.code shouldBe RegistrationResponse.OK
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
                    setBody(Json.encodeToString(exReg(hap1(t).slug, user1).copy(answers = emptyList())))
                }

                submitRegCall.status shouldBe HttpStatusCode.OK
                val res: RegistrationResponseJson = submitRegCall.body()

                res.code shouldBe RegistrationResponse.OK
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
                    setBody(Json.encodeToString(exReg(hap1(t).slug, user1)))
                }

                submitRegCall.status shouldBe HttpStatusCode.OK
                val res: RegistrationResponseJson = submitRegCall.body()

                res.code shouldBe RegistrationResponse.OK

                val submitRegAgainCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(hap1(t).slug, user1)))
                }

                submitRegAgainCall.status shouldBe HttpStatusCode.UnprocessableEntity
                val resAgain: RegistrationResponseJson = submitRegAgainCall.body()

                resAgain.code shouldBe RegistrationResponse.AlreadySubmitted
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
                    setBody(Json.encodeToString(exReg(hap8(t).slug, user1)))
                }

                fillUpRegsCall.status shouldBe HttpStatusCode.OK
                val fillUpRes: RegistrationResponseJson = fillUpRegsCall.body()

                fillUpRes.code shouldBe RegistrationResponse.OK

                val submitRegCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    setBody(
                        Json.encodeToString(
                            exReg(hap8(t).slug, user2)
                        )
                    )
                }

                submitRegCall.status shouldBe HttpStatusCode.Accepted
                val res: RegistrationResponseJson = submitRegCall.body()

                res.code shouldBe RegistrationResponse.WaitList

                val submitRegAgainCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    setBody(
                        Json.encodeToString(
                            exReg(hap8(t).slug, user2)
                        )
                    )
                }

                submitRegAgainCall.status shouldBe HttpStatusCode.UnprocessableEntity
                val resAgain: RegistrationResponseJson = submitRegAgainCall.body()

                resAgain.code shouldBe RegistrationResponse.AlreadySubmittedWaitList
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
                    setBody(Json.encodeToString(exReg(hap3(t).slug, user1)))
                }

                submitRegCall.status shouldBe HttpStatusCode.Forbidden
                val res: RegistrationResponseJson = submitRegCall.body()

                res.code shouldBe RegistrationResponse.TooEarly
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
                    setBody(Json.encodeToString(exReg(hap10(t).slug, user1)))
                }

                submitRegCall.status shouldBe HttpStatusCode.Forbidden
                val res: RegistrationResponseJson = submitRegCall.body()

                res.code shouldBe RegistrationResponse.TooLate
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
                        setBody(Json.encodeToString(exReg("ikke-eksisterende-happening-som-ikke-finnes-engang", user1)))
                    }

                submitRegCall.status shouldBe HttpStatusCode.Conflict
                val res: RegistrationResponseJson = submitRegCall.body()

                res.code shouldBe RegistrationResponse.HappeningDoesntExist
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
                val submitRegCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(exReg(hap8(t).slug, user1)))
                }

                submitRegCall.status shouldBe HttpStatusCode.OK
                val res: RegistrationResponseJson = submitRegCall.body()

                res.code shouldBe RegistrationResponse.OK

                for (u in listOf(user2, user3, user4, user5)) {
                    val submitRegWaitListCall = client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        setBody(Json.encodeToString(exReg(hap1(t).slug, u)))
                    }

                    submitRegWaitListCall.status shouldBe HttpStatusCode.Accepted
                    val resAgain: RegistrationResponseJson = submitRegWaitListCall.body()

                    resAgain.code shouldBe RegistrationResponse.WaitList
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
                val submitRegCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    setBody(
                        Json.encodeToString(
                            exReg(hap5(t).slug, user1)
                        )
                    )
                }

                submitRegCall.status shouldBe HttpStatusCode.Forbidden
                val res: RegistrationResponseJson = submitRegCall.body()

                res.code shouldBe RegistrationResponse.NotInRange

                val submitRegCall2 = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    setBody(
                        Json.encodeToString(
                            exReg(hap4(t).slug, user6)
                        )
                    )
                }

                submitRegCall2.status shouldBe HttpStatusCode.Forbidden
                val res2: RegistrationResponseJson = submitRegCall.body()

                res2.code shouldBe RegistrationResponse.NotInRange
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
                for (u in users) {
                    val submitRegCall = client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            Json.encodeToString(
                                exReg(hap7(t).slug, u)
                            )
                        )
                    }

                    submitRegCall.status shouldBe HttpStatusCode.OK
                    val res: RegistrationResponseJson = submitRegCall.body()

                    res.code shouldBe RegistrationResponse.OK
                }
            }
        }
}

private fun insertTestData(t: HAPPENING_TYPE) {
    transaction {
        addLogger(StdOutSqlLogger)

        StudentGroup.batchInsert(validStudentGroups, ignore = true) {
            this[StudentGroup.name] = it
        }

        User.batchInsert(users, ignore = true) {
            this[User.email] = it.email
            this[User.name] = it.name
            this[User.alternateEmail] = it.alternateEmail
            this[User.degree] = it.degree.toString()
            this[User.degreeYear] = it.degreeYear
        }

        for (user in users) {
            StudentGroupMembership.batchInsert(user.memberships, ignore = true) {
                this[StudentGroupMembership.userEmail] = user.email
                this[StudentGroupMembership.studentGroupName] = it
            }
        }
    }
    insertOrUpdateHappening(hap1(t))
    insertOrUpdateHappening(hap2(t))
    insertOrUpdateHappening(hap3(t))
    insertOrUpdateHappening(hap4(t))
    insertOrUpdateHappening(hap5(t))
    insertOrUpdateHappening(hap6(t))
    insertOrUpdateHappening(hap7(t))
    insertOrUpdateHappening(hap8(t))
    insertOrUpdateHappening(hap9(t))
    insertOrUpdateHappening(hap10(t))
}
