package no.uib.echo

import io.ktor.application.*
import io.ktor.features.CORS
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.server.netty.EngineMain
import no.uib.echo.plugins.configureRouting
import java.lang.Exception

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

    val adminKey = System.getenv("ADMIN_KEY") ?: throw Exception("ADMIN_KEY not defined.")

    val keys: Map<String, String> = mapOf(
        "admin" to adminKey
    )

    Db.init()
    configureRouting(keys)
}
