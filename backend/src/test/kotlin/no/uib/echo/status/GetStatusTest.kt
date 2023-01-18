package no.uib.echo.status

import io.kotest.matchers.shouldBe
import io.ktor.client.request.get
import io.ktor.http.HttpStatusCode
import io.ktor.server.testing.testApplication
import kotlin.test.Test

class GetStatusTest {
    @Test
    fun `Should respond with 200 OK`() =
        testApplication {
            val res = client.get("/status")

            res.status shouldBe HttpStatusCode.OK
        }

    @Test
    fun `Should rate limit after 200 requests`() =
        testApplication {
            for (i in 1..200) {
                val res = client.get("/status")
                res.status shouldBe HttpStatusCode.OK
            }

            val res = client.get("/status")
            res.status shouldBe HttpStatusCode.TooManyRequests
        }
}
