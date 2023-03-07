package no.uib.echo.registration

import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.ktor.client.call.body
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.request.bearerAuth
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.testing.testApplication
import no.uib.echo.DatabaseHandler
import no.uib.echo.Environment
import no.uib.echo.RegistrationResponse
import no.uib.echo.RegistrationResponseJson
import no.uib.echo.adminUser
import no.uib.echo.be
import no.uib.echo.exReg
import no.uib.echo.hap9
import no.uib.echo.schema.StudentGroup
import no.uib.echo.schema.StudentGroupMembership
import no.uib.echo.schema.User
import no.uib.echo.schema.insertOrUpdateHappening
import no.uib.echo.schema.nullableDegreeToString
import no.uib.echo.schema.validStudentGroups
import no.uib.echo.tables
import no.uib.echo.user1
import no.uib.echo.user10
import no.uib.echo.user2
import no.uib.echo.user3
import no.uib.echo.user4
import no.uib.echo.user5
import no.uib.echo.user6
import no.uib.echo.user7
import no.uib.echo.user8
import no.uib.echo.user9
import no.uib.echo.usersWithAdmin
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.batchInsert
import org.jetbrains.exposed.sql.transactions.transaction
import java.net.URI
import kotlin.test.AfterTest
import kotlin.test.BeforeTest
import kotlin.test.Test

class DeleteRegistrationsTest {
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
    fun `Should delete registrations properly`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }

            val usersSublist = listOf(user1, user2, user3, user4, user5)
            val waitListUsers = listOf(user6, user7, user8, user9, user10)

            val getAdminTokenCall = client.get("/token/${adminUser.email}")

            getAdminTokenCall.status shouldBe HttpStatusCode.OK
            val adminToken: String = getAdminTokenCall.body()

            for (t in be) {
                for (u in usersSublist) {
                    val getTokenCall = client.get("/token/${u.email}")

                    getTokenCall.status shouldBe HttpStatusCode.OK
                    val token: String = getTokenCall.body()

                    val submitRegCall = client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        bearerAuth(token)
                        setBody(exReg(hap9(t).slug, u))
                    }

                    submitRegCall.status shouldBe HttpStatusCode.OK
                    val res: RegistrationResponseJson = submitRegCall.body()

                    res.code shouldBe RegistrationResponse.OK
                }

                for (u in waitListUsers) {
                    val getTokenCall = client.get("/token/${u.email}")

                    getTokenCall.status shouldBe HttpStatusCode.OK
                    val token: String = getTokenCall.body()

                    val submitRegCall = client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        bearerAuth(token)
                        setBody(exReg(hap9(t).slug, u))
                    }

                    submitRegCall.status shouldBe HttpStatusCode.Accepted
                    val res: RegistrationResponseJson = submitRegCall.body()

                    res.code shouldBe RegistrationResponse.WaitList
                }

                for (u in usersSublist) {
                    val regEmail = u.email.lowercase()
                    val deleteRegCall = client.delete("/registration/${hap9(t).slug}/$regEmail") {
                        bearerAuth(adminToken)
                    }

                    deleteRegCall.status shouldBe HttpStatusCode.OK
                    deleteRegCall.bodyAsText() shouldContain "Registration with email = $regEmail and slug = ${
                    hap9(t).slug
                    } deleted"
                }
            }
        }
}

private fun insertTestData() {
    transaction {
        StudentGroup.batchInsert(validStudentGroups) {
            this[StudentGroup.name] = it
        }

        User.batchInsert(usersWithAdmin) {
            this[User.email] = it.email
            this[User.name] = it.name
            this[User.alternateEmail] = it.alternateEmail
            this[User.degree] = nullableDegreeToString(it.degree)
            this[User.degreeYear] = it.degreeYear
        }

        for (user in usersWithAdmin) {
            StudentGroupMembership.batchInsert(user.memberships) {
                this[StudentGroupMembership.userEmail] = user.email
                this[StudentGroupMembership.studentGroupName] = it
            }
        }
    }

    for (t in be) {
        insertOrUpdateHappening(hap9(t))
    }
}
