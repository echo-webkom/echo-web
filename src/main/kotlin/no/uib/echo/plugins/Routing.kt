package no.uib.echo.plugins

import io.ktor.routing.*
import io.ktor.application.*
import io.ktor.gson.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import no.uib.echo.BedpresJson
import no.uib.echo.BedpresSlugJson
import no.uib.echo.RegistrationJson
import no.uib.echo.ShortRegistrationJson
import no.uib.echo.deleteBedpresBySlug
import no.uib.echo.deleteRegistration
import no.uib.echo.insertOrUpdateBedpres
import no.uib.echo.insertRegistration
import no.uib.echo.selectRegistrations

fun Application.configureRouting(authKey: String) {
    install(ContentNegotiation) {
        gson()
    }

    routing {
        getRegistration(authKey)
        submitRegistration()
        deleteRegistration(authKey)

        submitBedpres(authKey)
        deleteBedpres(authKey)
    }
}

private const val registrationRoute: String = "registration"
private const val bedpresRoute: String = "bedpres"

fun Route.getRegistration(authKey: String) {
    get("/$registrationRoute") {
        val emailParam: String? = call.request.queryParameters["email"]
        val slugParam: String? = call.request.queryParameters["slug"]
        val auth: String? = call.request.header(HttpHeaders.Authorization)

        if (auth != authKey) {
            call.respond(HttpStatusCode.Unauthorized, "Not authorized.")
            return@get
        }

        val result = selectRegistrations(emailParam, slugParam)

        if (result != null)
            call.respond(result)
        else
            call.respond(HttpStatusCode.BadRequest, "No email or slug given.")
    }
}

fun Route.submitRegistration() {
    post("/$registrationRoute") {
        try {
            val registration = call.receive<RegistrationJson>()

            if (!registration.email.contains('@')) {
                call.respond(HttpStatusCode.BadRequest, "Email is not valid.")
                return@post
            }

            if (registration.degreeYear < 1 || registration.degreeYear > 5) {
                call.respond(HttpStatusCode.BadRequest, "Degree year is not valid.")
                return@post
            }

            if (!registration.terms) {
                call.respond(HttpStatusCode.BadRequest, "Terms not accepted.")
                return@post
            }

            insertRegistration(registration)

            call.respond(HttpStatusCode.OK, "Submitted registration.")
        } catch (e: Exception) {
            call.respond(HttpStatusCode.BadRequest, "Error submitting registration.")
            System.err.println(e.printStackTrace())
        }
    }
}

fun Route.deleteRegistration(authKey: String) {
    delete("/$registrationRoute") {
        try {
            val shortReg = call.receive<ShortRegistrationJson>()
            val auth: String? = call.request.header(HttpHeaders.Authorization)

            if (auth != authKey) {
                call.respond(HttpStatusCode.Unauthorized, "Not authorized.")
                return@delete
            }

            deleteRegistration(shortReg)

            call.respond(
                HttpStatusCode.OK,
                "Registration with email = ${shortReg.email} and slug = ${shortReg.slug} deleted."
            )
        } catch (e: Exception) {
            call.respond(HttpStatusCode.BadRequest, "Error deleting bedpres.")
            System.err.println(e.printStackTrace())
        }
    }
}

fun Route.submitBedpres(authKey: String) {
    put("/$bedpresRoute") {
        val auth: String? = call.request.header(HttpHeaders.Authorization)

        if (auth != authKey) {
            call.respond(HttpStatusCode.Unauthorized, "Not authorized.")
            return@put
        }

        try {
            val bedpres = call.receive<BedpresJson>()

            val result = insertOrUpdateBedpres(bedpres)

            call.respond(result.first, result.second)
        } catch (e: Exception) {
            call.respond(HttpStatusCode.BadRequest, "Error submitting bedpres.")
            System.err.println(e.printStackTrace())
        }
    }
}

fun Route.deleteBedpres(authKey: String) {
    delete("/$bedpresRoute") {
        val auth: String? = call.request.header(HttpHeaders.Authorization)
        val slug = call.receive<BedpresSlugJson>()

        if (auth != authKey) {
            call.respond(HttpStatusCode.Unauthorized, "Not authorized.")
            return@delete
        }

        deleteBedpresBySlug(slug)

        call.respond(HttpStatusCode.OK, "Bedpres with slug = ${slug.slug} deleted.")
    }
}