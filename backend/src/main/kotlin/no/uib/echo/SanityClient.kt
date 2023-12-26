package no.uib.echo

import io.ktor.client.HttpClient
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.request.get
import io.ktor.client.statement.HttpResponse
import io.ktor.serialization.kotlinx.json.json
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import java.net.URLEncoder

class SanityClient(
    projectId: String,
    dataset: String,
    apiVersion: String,
    useCdn: Boolean,
) {
    private val domain = if (useCdn) "apicdn.sanity.io" else "api.sanity.io"
    private val baseUrl = "https://$projectId.$domain/$apiVersion/data/query/$dataset"

    suspend fun fetch(query: String): HttpResponse {
        val encodedQuery =
            withContext(Dispatchers.IO) {
                URLEncoder.encode(query, "UTF-8")
            }

        val url = "$baseUrl?query=$encodedQuery"

        return HttpClient {
            install(Logging)
            install(ContentNegotiation) {
                json(
                    Json {
                        ignoreUnknownKeys = true
                        coerceInputValues = true
                    },
                )
            }
        }.use {
            it.get(url)
        }
    }
}
