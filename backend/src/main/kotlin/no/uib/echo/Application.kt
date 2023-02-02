package no.uib.echo

import io.ktor.server.application.Application
import io.ktor.server.netty.EngineMain
import no.uib.echo.plugins.configureAuthentication
import no.uib.echo.plugins.configureCORS
import no.uib.echo.plugins.configureContentNegotiation
import no.uib.echo.plugins.configureDocs
import no.uib.echo.plugins.configureRateLimit
import no.uib.echo.plugins.configureRouting
import java.net.URI

fun main(args: Array<String>) {
    EngineMain.main(args)
}

fun Application.module() {
    val env = environment.config.property("ktor.environment").getString().toEnvironment()
    val adminKey = environment.config.property("ktor.adminKey").getString()
    val databaseUrl = URI(environment.config.property("ktor.databaseUrl").getString())

    val migrateDb = environment.config.property("ktor.migrateDb").getString().toBooleanStrict()
    val initDb = environment.config.property("ktor.initDb").getString().toBooleanStrict()
    val useJwtTest = environment.config.property("ktor.useJwtTest").getString().toBooleanStrict()
    val sendEmailReg = environment.config.property("ktor.sendEmailRegistration").getString().toBooleanStrict()

    val mbMaxPoolSize = environment.config.propertyOrNull("ktor.maxPoolSize")?.getString()
    val maybeSendGridApiKey = environment.config.propertyOrNull("ktor.sendGridApiKey")?.getString()
    val sendGridApiKey = when (maybeSendGridApiKey.isNullOrEmpty()) {
        true -> null
        false -> maybeSendGridApiKey
    }

    val secret = environment.config.propertyOrNull("jwt.secret")?.getString()
    val issuer = environment.config.property("jwt.issuer").getString()
    val audience = environment.config.property("jwt.audience").getString()
    val realm = environment.config.property("jwt.realm").getString()

    val jwtConfig = if (env == Environment.PREVIEW || useJwtTest) "auth-jwt-test" else "auth-jwt"

    if (sendGridApiKey == null && env == Environment.PRODUCTION && sendEmailReg) {
        throw Exception("SENDGRID_API_KEY not defined in non-dev environment, with SEND_EMAIL_REGISTRATION = $sendEmailReg.")
    }

    if (secret == null && env == Environment.PREVIEW) {
        throw Exception("AUTH_SECRET not defined in preview environment.")
    }

    if (initDb) {
        DatabaseHandler(
            env,
            migrateDb,
            databaseUrl,
            mbMaxPoolSize
        ).init()
    }

    configureCORS(env)
    configureAuthentication(adminKey, audience, issuer, secret, realm)
    configureContentNegotiation()
    configureRouting(
        featureToggles = FeatureToggles(sendEmailReg = sendEmailReg),
        env = env,
        sendGridApiKey = sendGridApiKey,
        audience = audience,
        issuer = issuer,
        secret = secret,
        jwtConfig = jwtConfig
    )
    configureRateLimit()
    if (env != Environment.PRODUCTION) configureDocs()
}
