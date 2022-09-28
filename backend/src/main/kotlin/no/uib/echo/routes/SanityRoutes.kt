package no.uib.echo.routes

import io.ktor.client.call.body
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import kotlinx.serialization.Serializable
import no.uib.echo.SanityClient
import no.uib.echo.schema.HappeningJson
import no.uib.echo.schema.insertOrUpdateHappening

@Serializable
data class SanityResponse(
    val query: String,
    val result: List<HappeningJson>
)

fun Application.sanityRoutes(dev: Boolean) {
    routing {
        authenticate("auth-admin", optional = dev) {
            sanitySync()
        }
    }
}

fun Route.sanitySync() {
    get("/sanity") {
        val client = SanityClient(
            projectId = "pgq2pd26",
            dataset = "production",
            apiVersion = "v2021-10-21",
            useCdn = true
        )

        val query = """
            *[_type == 'happening' && defined(registrationDate) && defined(spotRanges) && count(spotRanges) > 0 && defined(studentGroupName) && !(_id in path('drafts.**'))] {
                "slug": slug.current, 
                title, registrationDate, 
                "happeningDate": date, spotRanges[] -> { 
                    spots, 
                    minDegreeYear, 
                    maxDegreeYear 
                }, 
                "type": happeningType, 
                studentGroupName
            }
        """.trimIndent()

        val response = client.fetch(query).body<SanityResponse>()

        val result = response.result.map {
            val (code, string) = insertOrUpdateHappening(it)

            if (code != HttpStatusCode.OK && code != HttpStatusCode.Accepted) {
                call.respond(code, string)
                return@get
            }

            string
        }

        call.respond(HttpStatusCode.OK, result)
    }
}
