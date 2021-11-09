package no.uib.echo

import com.sendgrid.SendGrid
import freemarker.cache.ClassTemplateLoader
import io.ktor.application.*
import io.ktor.features.CORS
import io.ktor.freemarker.*
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.server.netty.EngineMain
import no.uib.echo.plugins.configureRouting
import kotlin.Exception

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
    val sendGridApiKey = System.getenv("SENDGRID_API_KEY")

    if (sendGridApiKey == null && System.getenv("DEV") == null)
        throw Exception("SENDGRID_API_KEY not defined in non-dev environment.")

    val sendGrid = if (sendGridApiKey == null) null else SendGrid(sendGridApiKey)

    Db.init()
    configureRouting(adminKey, sendGrid)
}
