package no.uib.echo

import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.netty.EngineMain
import io.ktor.server.plugins.cors.routing.CORS
import no.uib.echo.plugins.configureRouting
import java.net.URI
import kotlin.Exception

data class FeatureToggles(
    val sendEmailReg: Boolean,
    val sendEmailHap: Boolean,
    val rateLimit: Boolean,
    val verifyRegs: Boolean
)

fun main(args: Array<String>) {
    EngineMain.main(args)
}

fun Application.module() {
    install(CORS) {
        anyHost()

        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Delete)

        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
    }

    val dev = environment.config.propertyOrNull("ktor.dev") != null
    val adminKey = environment.config.property("ktor.adminKey").getString()
    val databaseUrl = URI(environment.config.property("ktor.databaseUrl").getString())
    val mbMaxPoolSize = environment.config.propertyOrNull("ktor.maxPoolSize")?.getString()
    val sendEmailReg = environment.config.property("ktor.sendEmailRegistration").getString().toBooleanStrict()
    val sendEmailHap = environment.config.property("ktor.sendEmailHappening").getString().toBooleanStrict()
    val verifyRegs = environment.config.property("ktor.verifyRegs").getString().toBooleanStrict()
    val maybeSendGridApiKey = environment.config.propertyOrNull("ktor.sendGridApiKey")?.getString()
    val sendGridApiKey = when (maybeSendGridApiKey.isNullOrEmpty()) {
        true -> null
        false -> maybeSendGridApiKey
    }

    if (sendGridApiKey == null && !dev && (sendEmailReg || sendEmailHap))
        throw Exception("SENDGRID_API_KEY not defined in non-dev environment, with SEND_EMAIL_REGISTRATION = $sendEmailReg and SEND_EMAIL_HAPPENING = $sendEmailHap.")

    DatabaseHandler(dev, databaseUrl, mbMaxPoolSize).init()

    configureRouting(
        adminKey,
        sendGridApiKey,
        dev,
        FeatureToggles(sendEmailReg = sendEmailReg, sendEmailHap = sendEmailHap, rateLimit = true, verifyRegs = verifyRegs)
    )
}
