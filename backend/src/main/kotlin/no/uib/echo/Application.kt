package no.uib.echo

import io.ktor.server.application.Application
import io.ktor.server.netty.EngineMain
import no.uib.echo.plugins.configureAuthentication
import no.uib.echo.plugins.configureCORS
import no.uib.echo.plugins.configureContentNegotiation
import no.uib.echo.plugins.configureRouting
import java.net.URI

data class FeatureToggles(
    val sendEmailReg: Boolean,
    val rateLimit: Boolean,
    val verifyRegs: Boolean
)

fun main(args: Array<String>) {
    EngineMain.main(args)
}

fun Application.module() {
    val dev = environment.config.propertyOrNull("ktor.dev") != null
    val testMigration = environment.config.property("ktor.testMigration").getString().toBooleanStrict()
    val disableJwtAuth = environment.config.property("ktor.disableJwtAuth").getString().toBooleanStrict()
    val shouldInitDb = environment.config.property("ktor.shouldInitDb").getString().toBooleanStrict()
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

    if (sendGridApiKey == null && !dev && sendEmailReg) {
        throw Exception("SENDGRID_API_KEY not defined in non-dev environment, with SEND_EMAIL_REGISTRATION = $sendEmailReg.")
    }

    if (shouldInitDb) {
        DatabaseHandler(
            dev,
            testMigration,
            databaseUrl,
            mbMaxPoolSize
        ).init()
    }

    configureCORS()
    configureAuthentication(adminKey)
    configureContentNegotiation()
    configureRouting(
        featureToggles = FeatureToggles(sendEmailReg = sendEmailReg, rateLimit = true, verifyRegs = verifyRegs),
        dev = dev,
        disableJwtAuth = disableJwtAuth,
        sendGridApiKey = sendGridApiKey
    )
}
