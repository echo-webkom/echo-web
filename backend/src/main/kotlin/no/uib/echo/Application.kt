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
import no.uib.echo.plugins.workshopRouting

data class FeatureToggles(
    val sendEmailReg: Boolean,
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
    val testMigration = environment.config.property("ktor.testMigration").getString().toBooleanStrict()
    val adminKey = environment.config.property("ktor.adminKey").getString()
    val databaseUrl = URI(environment.config.property("ktor.databaseUrl").getString())
    val mbMaxPoolSize = environment.config.propertyOrNull("ktor.maxPoolSize")?.getString()
    val sendEmailReg = environment.config.property("ktor.sendEmailRegistration").getString().toBooleanStrict()
    val verifyRegs = environment.config.property("ktor.verifyRegs").getString().toBooleanStrict()
    val maybeSendGridApiKey = environment.config.propertyOrNull("ktor.sendGridApiKey")?.getString()
    val sendGridApiKey = when (maybeSendGridApiKey.isNullOrEmpty()) {
        true -> null
        false -> maybeSendGridApiKey
    }

    if (sendGridApiKey == null && !dev && sendEmailReg)
        throw Exception("SENDGRID_API_KEY not defined in non-dev environment, with SEND_EMAIL_REGISTRATION = $sendEmailReg.")

    DatabaseHandler(dev, testMigration, databaseUrl, mbMaxPoolSize).init()

    configureRouting(
        adminKey = adminKey,
        featureToggles = FeatureToggles(sendEmailReg = sendEmailReg, rateLimit = true, verifyRegs = verifyRegs),
        dev = dev,
        disableJwtAuth = false,
        sendGridApiKey = sendGridApiKey,
    )
}

fun Application.workshop() {
    val dev = environment.config.propertyOrNull("ktor.dev") != null
    val databaseUrl = URI(environment.config.property("ktor.databaseUrl").getString())
    val mbMaxPoolSize = environment.config.propertyOrNull("ktor.maxPoolSize")?.getString()

    DatabaseHandler(dev, testMigration = false, databaseUrl, mbMaxPoolSize).init()

    workshopRouting()
}
