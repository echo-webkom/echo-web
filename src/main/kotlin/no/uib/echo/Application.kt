package no.uib.echo

import freemarker.cache.ClassTemplateLoader
import io.ktor.application.*
import io.ktor.features.CORS
import io.ktor.freemarker.*
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.server.netty.EngineMain
import no.uib.echo.plugins.configureRouting
import kotlin.Exception

data class FeatureToggles(val sendEmailReg: Boolean, val sendEmailHap: Boolean, val rateLimit: Boolean)

fun main(args: Array<String>) {
    EngineMain.main(args)
}

fun Application.module() {
    install(CORS) {
        run {
            method(HttpMethod.Get)
            header(HttpHeaders.AccessControlAllowOrigin)
            anyHost()
            allowNonSimpleContentTypes = true
        }
        run {
            method(HttpMethod.Post)
            header(HttpHeaders.AccessControlAllowOrigin)
            anyHost()
            allowNonSimpleContentTypes = true
        }
        run {
            method(HttpMethod.Put)
            header(HttpHeaders.AccessControlAllowOrigin)
            anyHost()
            allowNonSimpleContentTypes = true
        }
        run {
            method(HttpMethod.Options)
            header(HttpHeaders.AccessControlAllowOrigin)
            anyHost()
            allowNonSimpleContentTypes = true
        }
        run {
            method(HttpMethod.Patch)
            header(HttpHeaders.AccessControlAllowOrigin)
            anyHost()
            allowNonSimpleContentTypes = true
        }
        run {
            method(HttpMethod.Delete)
            header(HttpHeaders.AccessControlAllowOrigin)
            anyHost()
            allowNonSimpleContentTypes = true
        }
    }

    install(FreeMarker) {
        // Set template directory
        templateLoader = ClassTemplateLoader(this::class.java.classLoader, "templates")
    }

    val adminKey = System.getenv("ADMIN_KEY") ?: throw Exception("ADMIN_KEY not defined.")
    // Default is false
    val sendEmailReg = (System.getenv("SEND_EMAIL_REGISTRATION")).toBoolean()
    // Default is true
    val sendEmailHap = when (System.getenv("SEND_EMAIL_HAPPENING")) {
        "false" -> false
        else -> true
    }
    val maybeSendGridApiKey = System.getenv("SENDGRID_API_KEY")
    val sendGridApiKey = when (maybeSendGridApiKey.isNullOrEmpty()) {
        true -> null
        false -> maybeSendGridApiKey
    }

    if (sendGridApiKey == null && System.getenv("DEV") == null && (sendEmailReg || sendEmailHap))
        throw Exception("SENDGRID_API_KEY not defined in non-dev environment, with SEND_EMAIL_REGISTRATION = $sendEmailReg and SEND_EMAIL_HAPPENING = $sendEmailHap.")

    Db.init()
    configureRouting(
        adminKey,
        sendGridApiKey,
        FeatureToggles(sendEmailReg = sendEmailReg, sendEmailHap = sendEmailHap, rateLimit = true)
    )
}
