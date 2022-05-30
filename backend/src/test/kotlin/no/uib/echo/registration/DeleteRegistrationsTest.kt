package no.uib.echo.registration

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.ktor.client.HttpClient
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
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import no.uib.echo.DatabaseHandler
import no.uib.echo.RegistrationResponse
import no.uib.echo.RegistrationResponseJson
import no.uib.echo.be
import no.uib.echo.exReg
import no.uib.echo.hap9
import no.uib.echo.schema.Answer
import no.uib.echo.schema.Happening
import no.uib.echo.schema.Registration
import no.uib.echo.schema.SpotRange
import no.uib.echo.schema.insertOrUpdateHappening
import no.uib.echo.schema.removeSlug
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import java.net.URI

class DeleteRegistrationsTest : StringSpec({
    val client = HttpClient {
        install(Logging)
        install(ContentNegotiation) {
            json()
        }
    }

    beforeSpec {
        DatabaseHandler(true, URI(System.getenv("DATABASE_URL")), null).init()
        for (t in be) {
            withContext(Dispatchers.IO) {
                insertOrUpdateHappening(
                    removeSlug(hap9(t)), hap9(t).slug, null, sendEmail = false, dev = true
                )
            }
        }
    }
    afterSpec {
        client.close()
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

    "Should delete registrations properly" {
        testApplication {
            val waitListAmount = 3

            for (t in be) {
                for (i in 1..hap9(t).spotRanges[0].spots) {
                    val submitRegCall = client.post("/happening/${hap9(t).slug}/registrations") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            Json.encodeToString(
                                exReg(t).copy(
                                    email = "${t}$i@test.com"
                                )
                            )
                        )
                    }

                    submitRegCall.status shouldBe HttpStatusCode.OK
                    val res: RegistrationResponseJson = submitRegCall.body()

                    res shouldNotBe null
                    res.code shouldBe RegistrationResponse.OK
                }

                for (i in 1..waitListAmount) {
                    val submitRegCall = client.post("/happening/${hap9(t).slug}/registrations") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            Json.encodeToString(
                                exReg(t).copy(
                                    email = "waitlist${t}$i@test.com"
                                )
                            )
                        )
                    }

                    submitRegCall.status shouldBe HttpStatusCode.Accepted
                    val res: RegistrationResponseJson = submitRegCall.body()

                    res shouldNotBe null
                    res.code shouldBe RegistrationResponse.WaitList
                }

                // Delete $waitListAmount registrations, such that all the registrations
                // previously on the wait list are now moved off the wait list.
                for (i in 1..waitListAmount) {
                    val regEmail = "${t}$i@test.com"
                    val nextRegOnWaitListEmail = "waitlist${t}$i@test.com"
                    val deleteRegCall = client.delete("/happening/${hap9(t).slug}/registrations/$regEmail")

                    deleteRegCall.status shouldBe HttpStatusCode.OK
                    deleteRegCall.bodyAsText() shouldBe "Registration with email = ${regEmail.lowercase()} and slug = ${
                    hap9(t).slug
                    } deleted, " + "and registration with email = ${nextRegOnWaitListEmail.lowercase()} moved off wait list."
                }

                // Delete the registrations that were moved off the wait list in the previous for-loop.
                for (i in 1..waitListAmount) {
                    val waitListRegEmail = "waitlist${t}$i@test.com"
                    val deleteWaitListRegCall =
                        client.delete("/happening/${hap9(t).slug}/registrations/$waitListRegEmail")

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
})
