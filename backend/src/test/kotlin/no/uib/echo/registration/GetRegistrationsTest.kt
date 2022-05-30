package no.uib.echo.registration

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.ktor.client.HttpClient
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
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import no.uib.echo.DatabaseHandler
import no.uib.echo.RegistrationResponse
import no.uib.echo.RegistrationResponseJson
import no.uib.echo.be
import no.uib.echo.exReg
import no.uib.echo.hap6
import no.uib.echo.schema.Answer
import no.uib.echo.schema.Degree
import no.uib.echo.schema.Happening
import no.uib.echo.schema.HappeningInfoJson
import no.uib.echo.schema.Registration
import no.uib.echo.schema.RegistrationJson
import no.uib.echo.schema.SpotRange
import no.uib.echo.schema.insertOrUpdateHappening
import no.uib.echo.schema.removeSlug
import no.uib.echo.schema.toCsv
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import java.net.URI

class GetRegistrationsTest : StringSpec({
    val client = HttpClient {
        install(Logging)
        install(ContentNegotiation) {
            json()
        }
    }

    beforeSpec {
        DatabaseHandler(true, URI(System.getenv("DATABASE_URL")), null).init()
        transaction {
            SchemaUtils.drop(
                Happening, Registration, Answer, SpotRange
            )
            SchemaUtils.create(
                Happening, Registration, Answer, SpotRange
            )
        }
        for (t in be) {
            withContext(Dispatchers.IO) {
                insertOrUpdateHappening(removeSlug(hap6(t)), hap6(t).slug, null, sendEmail = false, dev = true)
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

    "Should get correct count of registrations and wait list registrations, and produce correct CSV list" {
        val waitListCount = 10

        for (t in be) {
            val newSlug = "auto-link-test-100-$t"

            val submitHappeningCall = client.put("/happening/$newSlug") {
                contentType(ContentType.Application.Json)
                setBody(Json.encodeToString(removeSlug(hap6(t).copy(slug = newSlug))))
                basicAuth("admin", System.getenv("ADMIN_KEY"))
            }

            submitHappeningCall.status shouldBe HttpStatusCode.OK

            val regsList = mutableListOf<RegistrationJson>()

            for (sr in hap6(t).spotRanges) {
                for (i in 1..(sr.spots + waitListCount)) {
                    val newReg = exReg(t).copy(
                        email = "$t${sr.minDegreeYear}${sr.maxDegreeYear}mIxEdcAsE$i@test.com",
                        degree = if (sr.maxDegreeYear > 3) Degree.PROG else Degree.DTEK,
                        degreeYear = if (sr.maxDegreeYear > 3) 4 else 2,
                        waitList = i > sr.spots
                    )
                    regsList.add(newReg.copy(email = newReg.email.lowercase()))

                    val submitRegCall = client.post("/happening/$newSlug/registrations") {
                        contentType(ContentType.Application.Json)
                        setBody(Json.encodeToString(newReg))
                    }

                    if (i > sr.spots) {
                        submitRegCall.status shouldBe HttpStatusCode.Accepted
                        val res: RegistrationResponseJson = submitRegCall.body()

                        res shouldNotBe null
                        res.code shouldBe RegistrationResponse.WaitList
                    } else {
                        submitRegCall.status shouldBe HttpStatusCode.OK
                        val res: RegistrationResponseJson = submitRegCall.body()

                        res shouldNotBe null
                        res.code shouldBe RegistrationResponse.OK
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

            val getRegistrationsListCall = client.get("/happening/$newSlug/registrations?download=y&testing=y")

            getRegistrationsListCall.status shouldBe HttpStatusCode.OK
            getRegistrationsListCall.bodyAsText() shouldBe toCsv(regsList, testing = true)

            val getRegistrationsListJsonCall = client.get("/happening/$newSlug/registrations?json=y&testing=y")

            getRegistrationsListJsonCall.status shouldBe HttpStatusCode.OK
            val registrationsList: List<RegistrationJson> = getRegistrationsListJsonCall.body()

            registrationsList.map {
                it.copy(submitDate = null)
            } shouldBe regsList
        }
    }

    "Should respond properly when given invalid slug of happening when happening info is requested" {
        for (t in be) {
            val getHappeningInfoCall = client.get("/happening//registrations") {
                basicAuth("admin", System.getenv("ADMIN_KEY"))
            }

            getHappeningInfoCall.status shouldBe HttpStatusCode.NotFound
            getHappeningInfoCall.bodyAsText() shouldBe "Happening doesn't exist."
        }
    }
})
