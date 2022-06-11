package no.uib.echo.status

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.ktor.client.request.get
import io.ktor.http.HttpStatusCode
import io.ktor.server.testing.testApplication
import no.uib.echo.plugins.Routing

class GetStatusTest : StringSpec({
    "Should respond with 200 OK" {
        testApplication {
            val res = client.get(Routing.getStatusRoute)

            res.status shouldBe HttpStatusCode.OK
        }
    }
})
