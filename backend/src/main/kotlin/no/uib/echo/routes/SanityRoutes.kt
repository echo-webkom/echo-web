package no.uib.echo.routes

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.request.get
import io.ktor.http.HttpStatusCode
import io.ktor.serialization.kotlinx.json.json
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import no.uib.echo.schema.HappeningJson
import no.uib.echo.schema.insertOrUpdateHappening

@Serializable
data class SanityResponse(
    val query: String,
    val result: List<HappeningJson>
)

fun Application.sanityRoutes(dev: Boolean) {
    routing {
        authenticate("auth-admin") {
            sanitySync(dev)
        }
    }
}

fun Route.sanitySync(dev: Boolean) {
    get("/sanity") {
        val client = HttpClient {
            install(Logging)
            install(ContentNegotiation) {
                json(
                    Json {
                        ignoreUnknownKeys = true
                        coerceInputValues = true
                    }
                )
            }
        }

        val response: SanityResponse =
            client.get("https://pgq2pd26.api.sanity.io/v2021-10-21/data/query/production?query=*%5B_type%20%3D%3D%20'happening'%20%26%26%20defined(registrationDate)%20%26%26%20defined(spotRanges)%20%26%26%20count(spotRanges)%20%3E%200%20%26%26%20defined(studentGroupName)%20%26%26%20!(_id%20in%20path('drafts.**'))%5D%20%7B%22slug%22%3A%20slug.current%2C%20title%2C%20registrationDate%2C%20%22happeningDate%22%3A%20date%2C%20spotRanges%5B%5D%20-%3E%20%7B%20spots%2C%20minDegreeYear%2C%20maxDegreeYear%20%7D%2C%20%22type%22%3A%20happeningType%2C%20%22organizerEmail%22%3A%20contactEmail%2C%20studentGroupName%7D%0A")
                .body()

        client.close()

        val result = response.result.map {
            val (code, string) = insertOrUpdateHappening(it, dev)

            if (code != HttpStatusCode.OK && code != HttpStatusCode.Accepted) {
                call.respond(code, string)
                return@get
            }

            string
        }

        call.respond(HttpStatusCode.OK, result)
    }
}
