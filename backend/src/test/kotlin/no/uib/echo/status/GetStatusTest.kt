package no.uib.echo.status

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.ktor.client.HttpClient
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.request.get
import io.ktor.http.HttpStatusCode
import io.ktor.server.testing.testApplication
import no.uib.echo.plugins.Routing

class GetStatusTest : StringSpec({
    val client = HttpClient {
        install(Logging)
    }

    afterSpec {
        client.close()
    }

    "Should respond with 200 OK" {
        testApplication {
            val res = client.get(Routing.getStatusRoute)

            res.status shouldBe HttpStatusCode.OK
        }
    }
})
