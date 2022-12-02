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
)

fun main(args: Array<String>) {
    EngineMain.main(args)
}

fun Application.module() {
    val dev = environment.config.propertyOrNull("ktor.dev") != null
    val testMigration = environment.config.property("ktor.testMigration").getString().toBooleanStrict()
    val shouldInitDb = environment.config.property("ktor.shouldInitDb").getString().toBooleanStrict()
    val adminKey = environment.config.property("ktor.adminKey").getString()
    val databaseUrl = URI(environment.config.property("ktor.databaseUrl").getString())
    val mbMaxPoolSize = environment.config.propertyOrNull("ktor.maxPoolSize")?.getString()
    val sendEmailReg = environment.config.property("ktor.sendEmailRegistration").getString().toBooleanStrict()
    val maybeSendGridApiKey = environment.config.propertyOrNull("ktor.sendGridApiKey")?.getString()
    val sendGridApiKey = when (maybeSendGridApiKey.isNullOrEmpty()) {
        true -> null
        false -> maybeSendGridApiKey
    }
    val secret = environment.config.property("jwt.secret").getString()
    val issuer = environment.config.property("jwt.issuer").getString()
    val audience = environment.config.property("jwt.audience").getString()
    val realm = environment.config.property("jwt.realm").getString()

    val jwtConfig = if (dev) "auth-jwt-test" else "auth-jwt"

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
    configureAuthentication(adminKey, audience, issuer, secret, realm)
    configureContentNegotiation()
    configureRouting(
        featureToggles = FeatureToggles(sendEmailReg = sendEmailReg, rateLimit = true),
        dev = dev,
        sendGridApiKey = sendGridApiKey,
        audience = audience,
        issuer = issuer,
        secret = secret,
        jwtConfig = jwtConfig
    )
}
