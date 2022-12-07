package no.uib.echo.registration

import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.ktor.client.call.body
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.request.bearerAuth
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.testing.testApplication
import no.uib.echo.DatabaseHandler
import no.uib.echo.Environment
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
import no.uib.echo.hap7
import no.uib.echo.hap8
import no.uib.echo.haps
import no.uib.echo.schema.StudentGroup
import no.uib.echo.schema.StudentGroupMembership
import no.uib.echo.schema.User
import no.uib.echo.schema.insertOrUpdateHappening
import no.uib.echo.schema.nullableDegreeToString
import no.uib.echo.schema.validStudentGroups
import no.uib.echo.tables
import no.uib.echo.user1
import no.uib.echo.user2
import no.uib.echo.user3
import no.uib.echo.user4
import no.uib.echo.user5
import no.uib.echo.user6
import no.uib.echo.users
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.batchInsert
import org.jetbrains.exposed.sql.transactions.transaction
import java.net.URI
import kotlin.test.AfterTest
import kotlin.test.BeforeTest
import kotlin.test.Test

class PostRegistrationsTest {
    companion object {
        val db = DatabaseHandler(
            env = Environment.PREVIEW,
            migrateDb = false,
            dbUrl = URI(System.getenv("DATABASE_URL")),
            mbMaxPoolSize = null
        )
    }

    @BeforeTest
    fun beforeTest() {
        db.init(false)
        insertTestData()
    }

    @AfterTest
    fun afterTest() {
        transaction {
            SchemaUtils.drop(*tables)
            SchemaUtils.create(*tables)
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

            for (u in users) {
                val getTokenCall = client.get("/token/${u.email}")

                getTokenCall.status shouldBe HttpStatusCode.OK
                val token: String = getTokenCall.body()

                for (t in be) {
                    val submitRegCall = client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        bearerAuth(token)
                        setBody(exReg(hap1(t).slug, u))
                    }

                    u.degree shouldNotBe null

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
            val getTokenCall = client.get("/token/${user1.email}")

            getTokenCall.status shouldBe HttpStatusCode.OK
            val token: String = getTokenCall.body()

            for (t in be) {
                for (slug in listOf(hap1(t).slug, hap2(t).slug)) {
                    val submitRegCall = client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        bearerAuth(token)
                        setBody(exReg(slug, user1))
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

            val getTokenCall = client.get("/token/${user1.email}")

            getTokenCall.status shouldBe HttpStatusCode.OK
            val token: String = getTokenCall.body()

            for (t in be) {
                val submitRegCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    bearerAuth(token)
                    setBody(exReg(hap1(t).slug, user1).copy(answers = emptyList()))
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

            val getTokenCall = client.get("/token/${user1.email}")

            getTokenCall.status shouldBe HttpStatusCode.OK
            val token: String = getTokenCall.body()

            for (t in be) {
                val submitRegCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    bearerAuth(token)
                    setBody(exReg(hap1(t).slug, user1))
                }

                submitRegCall.status shouldBe HttpStatusCode.OK
                val res: RegistrationResponseJson = submitRegCall.body()

                res.code shouldBe RegistrationResponse.OK

                val submitRegAgainCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    bearerAuth(token)
                    setBody(exReg(hap1(t).slug, user1))
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

            val getTokenCall1 = client.get("/token/${user1.email}")

            getTokenCall1.status shouldBe HttpStatusCode.OK
            val token1: String = getTokenCall1.body()

            val getTokenCall2 = client.get("/token/${user2.email}")

            getTokenCall2.status shouldBe HttpStatusCode.OK
            val token2: String = getTokenCall2.body()

            for (t in be) {
                val fillUpRegsCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    bearerAuth(token1)
                    setBody(exReg(hap8(t).slug, user1))
                }

                fillUpRegsCall.status shouldBe HttpStatusCode.OK
                val fillUpRes: RegistrationResponseJson = fillUpRegsCall.body()

                fillUpRes.code shouldBe RegistrationResponse.OK

                val submitRegCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    bearerAuth(token2)
                    setBody(exReg(hap8(t).slug, user2))
                }

                submitRegCall.status shouldBe HttpStatusCode.Accepted
                val res: RegistrationResponseJson = submitRegCall.body()

                res.code shouldBe RegistrationResponse.WaitList

                val submitRegAgainCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    bearerAuth(token2)
                    setBody(exReg(hap8(t).slug, user2))
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

            val getTokenCall = client.get("/token/${user1.email}")

            getTokenCall.status shouldBe HttpStatusCode.OK
            val token: String = getTokenCall.body()

            for (t in be) {
                val submitRegCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    bearerAuth(token)
                    setBody(exReg(hap3(t).slug, user1))
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
            val getTokenCall = client.get("/token/${user1.email}")

            getTokenCall.status shouldBe HttpStatusCode.OK
            val token: String = getTokenCall.body()

            for (t in be) {
                val submitRegCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    bearerAuth(token)
                    setBody(exReg(hap10(t).slug, user1))
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

            val getTokenCall = client.get("/token/${user1.email}")

            getTokenCall.status shouldBe HttpStatusCode.OK
            val token: String = getTokenCall.body()

            for (t in be) {
                val submitRegCall =
                    client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        bearerAuth(token)
                        setBody(exReg("ikke-eksisterende-happening-som-ikke-finnes-engang", user1))
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

            val getTokenCall = client.get("/token/${user1.email}")

            getTokenCall.status shouldBe HttpStatusCode.OK
            val token: String = getTokenCall.body()

            for (t in be) {
                val submitRegCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    bearerAuth(token)
                    setBody(exReg(hap8(t).slug, user1))
                }

                submitRegCall.status shouldBe HttpStatusCode.OK
                val res: RegistrationResponseJson = submitRegCall.body()

                res.code shouldBe RegistrationResponse.OK

                for (u in listOf(user2, user3, user4, user5)) {
                    val getOtherTokenCall = client.get("/token/${u.email}")

                    getOtherTokenCall.status shouldBe HttpStatusCode.OK
                    val otherToken: String = getOtherTokenCall.body()

                    val submitRegWaitListCall = client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        bearerAuth(otherToken)
                        setBody(exReg(hap8(t).slug, u))
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

            val getTokenCall1 = client.get("/token/${user1.email}")

            getTokenCall1.status shouldBe HttpStatusCode.OK
            val token1: String = getTokenCall1.body()

            val getTokenCall2 = client.get("/token/${user6.email}")

            getTokenCall2.status shouldBe HttpStatusCode.OK
            val token2: String = getTokenCall2.body()

            for (t in be) {
                val submitRegCall = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    bearerAuth(token1)
                    setBody(exReg(hap5(t).slug, user1))
                }

                submitRegCall.status shouldBe HttpStatusCode.Forbidden
                val res: RegistrationResponseJson = submitRegCall.body()

                res.code shouldBe RegistrationResponse.NotInRange

                val submitRegCall2 = client.post("/registration") {
                    contentType(ContentType.Application.Json)
                    bearerAuth(token2)
                    setBody(exReg(hap4(t).slug, user6))
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
            for (u in users) {
                val getTokenCall = client.get("/token/${u.email}")

                getTokenCall.status shouldBe HttpStatusCode.OK
                val token: String = getTokenCall.body()

                for (t in be) {
                    val submitRegCall = client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        bearerAuth(token)
                        setBody(exReg(hap7(t).slug, u))
                    }

                    submitRegCall.status shouldBe HttpStatusCode.OK
                    val res: RegistrationResponseJson = submitRegCall.body()

                    res.code shouldBe RegistrationResponse.OK
                }
            }
        }
}

private fun insertTestData() {
    transaction {
        StudentGroup.batchInsert(validStudentGroups) {
            this[StudentGroup.name] = it
        }

        User.batchInsert(users) {
            this[User.email] = it.email
            this[User.name] = it.name
            this[User.alternateEmail] = it.alternateEmail
            this[User.degree] = nullableDegreeToString(it.degree)
            this[User.degreeYear] = it.degreeYear
        }

        for (user in users) {
            StudentGroupMembership.batchInsert(user.memberships) {
                this[StudentGroupMembership.userEmail] = user.email
                this[StudentGroupMembership.studentGroupName] = it
            }
        }
    }

    for (t in be) {
        for (hap in haps(t)) {
            insertOrUpdateHappening(hap)
        }
    }
}
