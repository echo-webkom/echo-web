package no.uib.echo.registration

import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldContain
import io.ktor.client.call.body
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.request.delete
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
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
import no.uib.echo.user7
import no.uib.echo.user8
import no.uib.echo.user9
import no.uib.echo.users

class DeleteRegistrationsTest {
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
    fun `Should delete registrations properly`() =
        testApplication {
            DatabaseHandler(
                dev = true,
                testMigration = false,
                dbUrl = URI(System.getenv("DATABASE_URL")),
                mbMaxPoolSize = null
            ).init(
                shouldInsertTestData = false
            )
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }

            val users = listOf(user1, user2, user3, user4, user5)
            val waitListUsers = listOf(user6, user7, user8, user9)

            for (t in be) {
                for (u in users) {
                    val submitRegCall = client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            Json.encodeToString(
                                exReg(hap9(t).slug, u)
                            )
                        )
                    }

                    submitRegCall.status shouldBe HttpStatusCode.OK
                    val res: RegistrationResponseJson = submitRegCall.body()

                    res.code shouldBe RegistrationResponse.OK
                }

                for (u in waitListUsers) {
                    val submitRegCall = client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            Json.encodeToString(
                                exReg(hap9(t).slug, u)
                            )
                        )
                    }

                    submitRegCall.status shouldBe HttpStatusCode.Accepted
                    val res: RegistrationResponseJson = submitRegCall.body()

                    res.code shouldBe RegistrationResponse.WaitList
                }

                // Delete $waitListAmount registrations, such that all the registrations
                // previously on the wait list are now moved off the wait list.
                for (u in waitListUsers) {
                    val regEmail = u.email
                    val deleteRegCall = client.delete("/registration/${hap9(t).slug}/$regEmail")

                    deleteRegCall.status shouldBe HttpStatusCode.OK
                    deleteRegCall.bodyAsText() shouldContain "Registration with email = ${regEmail.lowercase()} and slug = ${
                    hap9(t).slug
                    } deleted, " + "and registration with email ="
                }

                // Delete the registrations that were moved off the wait list in the previous for-loop.
                for (u in waitListUsers) {
                    val waitListRegEmail = u.email
                    val deleteWaitListRegCall =
                        client.delete("/registration/${hap9(t).slug}/$waitListRegEmail")

                    deleteWaitListRegCall.status shouldBe HttpStatusCode.OK
                    deleteWaitListRegCall.bodyAsText() shouldBe "Registration with email = ${waitListRegEmail.lowercase()} and slug = ${
                    hap9(
                        t
                    ).slug
                    } deleted."
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
    insertOrUpdateHappening(hap9(t))
}
