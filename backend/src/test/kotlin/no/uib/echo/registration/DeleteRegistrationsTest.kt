package no.uib.echo.registration

import io.kotest.matchers.shouldBe
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
import no.uib.echo.Response
import no.uib.echo.ResponseJson
import no.uib.echo.be
import no.uib.echo.exReg
import no.uib.echo.hap9
import no.uib.echo.schema.Answer
import no.uib.echo.schema.Feedback
import no.uib.echo.schema.HAPPENING_TYPE
import no.uib.echo.schema.Happening
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
                Happening, Registration, Answer, SpotRange, User, Feedback, StudentGroup, StudentGroupMembership
            )
            SchemaUtils.create(
                Happening, Registration, Answer, SpotRange, User, Feedback, StudentGroup, StudentGroupMembership
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
            val waitListAmount = 3

            for (t in be) {
                for (i in 1..hap9(t).spotRanges[0].spots) {
                    val submitRegCall = client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            Json.encodeToString(
                                exReg(t, hap9(t).slug).copy(
                                    email = "${t}$i@test.com"
                                )
                            )
                        )
                    }

                    submitRegCall.status shouldBe HttpStatusCode.OK
                    val res: ResponseJson = submitRegCall.body()

                    res.code shouldBe Response.OK
                }

                for (i in 1..waitListAmount) {
                    val submitRegCall = client.post("/registration") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            Json.encodeToString(
                                exReg(t, hap9(t).slug).copy(
                                    email = "waitlist${t}$i@test.com"
                                )
                            )
                        )
                    }

                    submitRegCall.status shouldBe HttpStatusCode.Accepted
                    val res: ResponseJson = submitRegCall.body()

                    res.code shouldBe Response.WaitList
                }

                // Delete $waitListAmount registrations, such that all the registrations
                // previously on the wait list are now moved off the wait list.
                for (i in 1..waitListAmount) {
                    val regEmail = "${t}$i@test.com"
                    val nextRegOnWaitListEmail = "waitlist${t}$i@test.com"
                    val deleteRegCall = client.delete("/registration/${hap9(t).slug}/$regEmail")

                    deleteRegCall.status shouldBe HttpStatusCode.OK
                    deleteRegCall.bodyAsText() shouldBe "Registration with email = ${regEmail.lowercase()} and slug = ${
                    hap9(t).slug
                    } deleted, " + "and registration with email = ${nextRegOnWaitListEmail.lowercase()} moved off wait list."
                }

                // Delete the registrations that were moved off the wait list in the previous for-loop.
                for (i in 1..waitListAmount) {
                    val waitListRegEmail = "waitlist${t}$i@test.com"
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

        StudentGroup.batchInsert(listOf("bedkom", "tilde"), ignore = true) {
            this[StudentGroup.name] = it
        }
    }
    insertOrUpdateHappening(hap9(t), dev = true)
}
