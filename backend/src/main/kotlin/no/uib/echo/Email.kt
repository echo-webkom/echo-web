package no.uib.echo

import io.ktor.client.HttpClient
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.request.bearerAuth
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import no.uib.echo.schema.HAPPENING_TYPE
import no.uib.echo.schema.Happening
import no.uib.echo.schema.RegistrationJson
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import java.io.IOException
import java.util.regex.Pattern

@Serializable
data class SendGridRequest(
    val personalizations: List<SendGridPersonalization>,
    val from: SendGridEmail,
    val template_id: String
)

@Serializable
data class SendGridPersonalization(
    val to: List<SendGridEmail>,
    val dynamic_template_data: SendGridTemplate
)

@Serializable
data class SendGridTemplate(
    val title: String,
    val link: String,
    val hapTypeLiteral: String,
    val waitListSpot: Int? = null,
    val registration: RegistrationJson? = null
)

@Serializable
data class SendGridEmail(val email: String, val name: String? = null)

enum class Template {
    CONFIRM_REG,
    CONFIRM_WAIT,
    REGS_LINK
}

private const val SENDGRID_ENDPOINT = "https://api.sendgrid.com/v3/mail/send"

fun fromEmail(email: String): String? {
    return when (email) {
        "tilde@echo.uib.no" -> "Tilde"
        "bedkom@echo.uib.no" -> "Bedkom"
        "webkom@echo.uib.no" -> "Webkom"
        "gnist@echo.uib.no" -> "Gnist"
        else -> null
    }
}

suspend fun sendConfirmationEmail(
    sendGridApiKey: String,
    registration: RegistrationJson,
    waitListSpot: Long?
) {
    val hapTypeLiteral = when (registration.type) {
        HAPPENING_TYPE.EVENT ->
            "arrangementet"
        HAPPENING_TYPE.BEDPRES ->
            "bedriftspresentasjonen"
    }

    val hap = transaction {
        addLogger(StdOutSqlLogger)

        Happening.select {
            Happening.slug eq registration.slug
        }.firstOrNull()
    } ?: throw Exception("Happening is null.")

    val fromEmail = "webkom@echo.uib.no"
    try {
        withContext(Dispatchers.IO) {
            sendEmail(
                fromEmail,
                registration.email,
                SendGridTemplate(
                    hap[Happening.title],
                    "https://echo.uib.no/event/${registration.slug}",
                    hapTypeLiteral,
                    waitListSpot = waitListSpot?.toInt(),
                    registration = registration
                ),
                if (waitListSpot != null) Template.CONFIRM_WAIT else Template.CONFIRM_REG,
                sendGridApiKey
            )
        }
    } catch (e: IOException) {
        e.printStackTrace()
    }
}

suspend fun sendEmail(
    from: String,
    to: String,
    sendGridTemplate: SendGridTemplate,
    template: Template,
    sendGridApiKey: String
) {
    if (!isEmailValid(from)) {
        System.err.println("Email address '$from' is not valid. Not sending email to address '$to'.")
        return
    }

    if (!isEmailValid(to)) {
        System.err.println("Email address '$to' is not valid. Not sending email from address '$from'.")
        return
    }

    val fromName = fromEmail(from)
    val fromPers =
        if (fromName != null)
            SendGridEmail(from, fromName)
        else
            SendGridEmail(from)

    val templateId = when (template) {
        Template.CONFIRM_REG -> "d-1fff3960b2184def9cf8bac082aeac21"
        Template.CONFIRM_WAIT -> "d-1965cd803e6940c1a6724e3c53b70275"
        Template.REGS_LINK -> "d-50e33549c29e46b7a6c871e97324ac5f"
    }

    val response: HttpResponse = HttpClient {
        install(Logging)
        install(ContentNegotiation) {
            json()
        }
    }.use { client ->
        client.post(SENDGRID_ENDPOINT) {
            contentType(ContentType.Application.Json)
            bearerAuth(sendGridApiKey)
            setBody(
                SendGridRequest(
                    listOf(
                        SendGridPersonalization(
                            to = listOf(SendGridEmail(to)),
                            dynamic_template_data = sendGridTemplate
                        )
                    ),
                    from = fromPers, template_id = templateId
                )
            )
        }
    }

    if (response.status != HttpStatusCode.Accepted) {
        throw IOException("Status code is not 202: ${response.status}, ${response.bodyAsText()}")
    }
}

fun isEmailValid(email: String): Boolean {
    return Pattern.compile(
        "^(([\\w-]+\\.)+[\\w-]+|([a-zA-Z]|[\\w-]{2,}))@" +
            "((([0-1]?\\d{1,2}|25[0-5]|2[0-4]\\d)\\.([0-1]?" +
            "\\d{1,2}|25[0-5]|2[0-4]\\d)\\." +
            "([0-1]?\\d{1,2}|25[0-5]|2[0-4]\\d)\\.([0-1]?" +
            "\\d{1,2}|25[0-5]|2[0-4]\\d))|" +
            "([a-zA-Z]+[\\w-]+\\.)+[a-zA-Z]{2,4})$"
    ).matcher(email).matches()
}
