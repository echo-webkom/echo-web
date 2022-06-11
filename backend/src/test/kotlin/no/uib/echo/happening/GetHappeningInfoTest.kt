package no.uib.echo.happening

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.ktor.client.call.body
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.testing.testApplication
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import no.uib.echo.RegistrationResponse
import no.uib.echo.RegistrationResponseJson
import no.uib.echo.be
import no.uib.echo.exReg
import no.uib.echo.hap6
import no.uib.echo.plugins.Routing
import no.uib.echo.schema.Answer
import no.uib.echo.schema.Happening
import no.uib.echo.schema.HappeningInfoJson
import no.uib.echo.schema.Registration
import no.uib.echo.schema.SpotRange
import no.uib.echo.schema.SpotRangeWithCountJson
import no.uib.echo.schema.User
import no.uib.echo.schema.insertOrUpdateHappening
import no.uib.echo.schema.removeSlug
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction

class GetHappeningInfoTest : StringSpec({
    beforeSpec {
        for (t in be) {
            insertOrUpdateHappening(
                removeSlug(hap6(t)), hap6(t).slug, null, sendEmail = false, dev = true
            )
        }
    }

    beforeTest {
        transaction {
            SchemaUtils.drop(
                Happening,
                Registration,
                Answer,
                SpotRange,
                User
            )
            SchemaUtils.create(
                Happening,
                Registration,
                Answer,
                SpotRange,
                User
            )
        }
    }

    "Should give correct happening info" {
        testApplication {
            val client = createClient {
                install(ContentNegotiation) {
                    json()
                }
            }

            for (t in be) {
                val totalRegCount = 40
                val totalWaitListCount = 10

                for (i in 1..totalRegCount + totalWaitListCount) {
                    val submitRegCall = client.post("/happening/${hap6(t).slug}/registrations") {
                        contentType(ContentType.Application.Json)
                        setBody(
                            Json.encodeToString(
                                exReg(t).copy(email = "${t}${i}test$@test.com", degreeYear = if (i % 2 == 0) 1 else 4)
                            )
                        )
                    }
                    if (i > totalRegCount)
                        submitRegCall.status shouldBe HttpStatusCode.Accepted
                    else
                        submitRegCall.status shouldBe HttpStatusCode.OK

                    val res: RegistrationResponseJson = submitRegCall.body()
                    res shouldNotBe null

                    if (i > totalRegCount)
                        res.code shouldBe RegistrationResponse.WaitList
                    else
                        res.code shouldBe RegistrationResponse.OK
                }

                val getHappeningInfoCall = client.get(routeWithSlug(hap6(t).slug))
                getHappeningInfoCall.status shouldBe HttpStatusCode.OK
                val res: HappeningInfoJson = getHappeningInfoCall.body()

                res shouldNotBe null
                res.spotRanges[0] shouldBe SpotRangeWithCountJson(20, 1, 2, totalRegCount / 2, totalWaitListCount / 2)
                res.spotRanges[0] shouldBe SpotRangeWithCountJson(20, 3, 5, totalRegCount / 2, totalWaitListCount / 2)
            }
        }
    }
})

private fun routeWithSlug(slug: String): String {
    return Routing.getHappeningInfoRoute.replace("{slug}", slug)
}
