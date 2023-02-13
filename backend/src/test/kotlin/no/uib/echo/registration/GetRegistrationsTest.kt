package no.uib.echo.registration

import io.kotest.matchers.shouldBe
import io.ktor.client.call.body
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.request.basicAuth
import io.ktor.client.request.bearerAuth
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
import no.uib.echo.schema.*
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
import no.uib.echo.users
import no.uib.echo.usersWithAdmin
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.batchInsert
import org.jetbrains.exposed.sql.transactions.transaction
import java.net.URI
import kotlin.test.AfterTest
import kotlin.test.BeforeTest
import kotlin.test.Test

class GetRegistrationsTest {
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
    fun `Should get correct count of registrations and wait list registrations, and produce correct CSV list`() =
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
                val regsList = mutableListOf<RegistrationJson>()

                for (u in users) {
                    val newReg = exReg(hap9(t).slug, u)
                    regsList.add(
                        RegistrationJson(
                            u.email,
                            u.alternateEmail,
                            u.name,
                            u.degree ?: Degree.DTEK,
                            u.degreeYear ?: 3,
                            newReg.slug,
                            null,
                            if (u in usersSublist) Status.REGISTERED else Status.WAITLIST,
                            null,
                            null,
                            newReg.answers,
                            u.memberships,
                        )
                    )

                    val getTokenCall = client.get("/token/${u.email}")

                    getTokenCall.status shouldBe HttpStatusCode.OK
                    val token: String = getTokenCall.body()

                    val submitRegCall = client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        bearerAuth(token)
                        setBody(newReg)
                    }

                    if (u in usersSublist) {
                        submitRegCall.status shouldBe HttpStatusCode.OK
                        val res: RegistrationResponseJson = submitRegCall.body()

                        res.code shouldBe RegistrationResponse.OK
                    } else {
                        submitRegCall.status shouldBe HttpStatusCode.Accepted
                        val res: RegistrationResponseJson = submitRegCall.body()

                        res.code shouldBe RegistrationResponse.WaitList
                    }
                }

                val getHappeningInfoCall = client.get("/happening/${hap9(t).slug}") {
                    basicAuth("admin", System.getenv("ADMIN_KEY"))
                }

                getHappeningInfoCall.status shouldBe HttpStatusCode.OK
                val happeningInfo: HappeningInfoJson = getHappeningInfoCall.body()

                happeningInfo.spotRanges[0].regCount shouldBe hap9(t).spotRanges[0].spots
                happeningInfo.spotRanges[0].waitListCount shouldBe waitListUsers.size

                val getRegistrationsListCall = client.get("/registration/${hap9(t).slug}?download=y&testing=y") {
                    bearerAuth(adminToken)
                }

                getRegistrationsListCall.status shouldBe HttpStatusCode.OK
                getRegistrationsListCall.bodyAsText() shouldBe toCsv(regsList, testing = true)

                val getRegistrationsListJsonCall = client.get("/registration/${hap9(t).slug}?json=y&testing=y") {
                    bearerAuth(adminToken)
                }

                getRegistrationsListJsonCall.status shouldBe HttpStatusCode.OK
                val registrationsList: List<RegistrationJson> = getRegistrationsListJsonCall.body()

                registrationsList.map {
                    it.copy(submitDate = null)
                } shouldBe regsList
            }
        }

    @Test
    fun `Should respond properly when given invalid slug of happening when happening info is requested`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            for (t in be) {
                val getHappeningInfoCall = client.get("/happening/random-slug-som-ikke-finnes") {
                    basicAuth("admin", System.getenv("ADMIN_KEY"))
                }

                getHappeningInfoCall.status shouldBe HttpStatusCode.NotFound
                getHappeningInfoCall.bodyAsText() shouldBe "Happening doesn't exist."
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
