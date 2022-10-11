package no.uib.echo.registration

import io.kotest.matchers.shouldBe
import io.ktor.client.call.body
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.request.basicAuth
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
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
import no.uib.echo.hap6
import no.uib.echo.schema.Degree
import no.uib.echo.schema.HappeningInfoJson
import no.uib.echo.schema.RegistrationJson
import no.uib.echo.schema.insertOrUpdateHappening
import no.uib.echo.schema.toCsv
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

class GetRegistrationsTest {
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
    fun `Should get correct count of registrations and wait list registrations, and produce correct CSV list`() =
        testApplication {
            val client = createClient {
                install(Logging)
                install(ContentNegotiation) {
                    json()
                }
            }
            val waitListCount = 10

            for (t in be) {
                val newSlug = "auto-link-test-100-$t"

                val submitHappeningCall = client.put("/happening") {
                    contentType(ContentType.Application.Json)
                    setBody(Json.encodeToString(hap6(t).copy(slug = newSlug)))
                    basicAuth("admin", System.getenv("ADMIN_KEY"))
                }

                submitHappeningCall.status shouldBe HttpStatusCode.OK

                val regsList = mutableListOf<RegistrationJson>()

                for (sr in hap6(t).spotRanges) {
                    for (i in 1..(sr.spots + waitListCount)) {
                        val newReg = exReg(t, newSlug).copy(
                            email = "$t${sr.minDegreeYear}${sr.maxDegreeYear}mIxEdcAsE$i@test.com",
                            degree = if (sr.maxDegreeYear > 3) Degree.PROG else Degree.DTEK,
                            degreeYear = if (sr.maxDegreeYear > 3) 4 else 2,
                            waitList = i > sr.spots
                        )
                        regsList.add(newReg.copy(email = newReg.email.lowercase()))

                        val submitRegCall = client.post("/registration") {
                            contentType(ContentType.Application.Json)
                            setBody(Json.encodeToString(newReg))
                        }

                        if (i > sr.spots) {
                            submitRegCall.status shouldBe HttpStatusCode.Accepted
                            val res: ResponseJson = submitRegCall.body()

                            res.code shouldBe Response.WaitList
                        } else {
                            submitRegCall.status shouldBe HttpStatusCode.OK
                            val res: ResponseJson = submitRegCall.body()

                            res.code shouldBe Response.OK
                        }
                    }
                }

                val getHappeningInfoCall = client.get("/happening/$newSlug") {
                    basicAuth("admin", System.getenv("ADMIN_KEY"))
                }

                getHappeningInfoCall.status shouldBe HttpStatusCode.OK
                val happeningInfo: HappeningInfoJson = getHappeningInfoCall.body()

                for (i in happeningInfo.spotRanges.indices) {
                    happeningInfo.spotRanges[i].regCount shouldBe hap6(t).spotRanges[i].spots
                    happeningInfo.spotRanges[i].waitListCount shouldBe waitListCount
                }

                val getRegistrationsListCall = client.get("/registration/$newSlug?download=y&testing=y")

                getRegistrationsListCall.status shouldBe HttpStatusCode.OK
                getRegistrationsListCall.bodyAsText() shouldBe toCsv(regsList, testing = true)

                val getRegistrationsListJsonCall = client.get("/registration/$newSlug?json=y&testing=y")

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

private fun insertTestData(t: HAPPENING_TYPE) {
    transaction {
        addLogger(StdOutSqlLogger)

        StudentGroup.batchInsert(listOf("bedkom", "tilde"), ignore = true) {
            this[StudentGroup.name] = it
        }
    }
    insertOrUpdateHappening(hap6(t), dev = true)
}
