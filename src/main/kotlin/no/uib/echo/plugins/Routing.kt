package no.uib.echo.plugins

import io.ktor.routing.*
import io.ktor.application.*
import io.ktor.gson.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import no.uib.echo.plugins.Routing.deleteBedpres
import no.uib.echo.plugins.Routing.deleteRegistration
import no.uib.echo.plugins.Routing.getRegistration
import no.uib.echo.plugins.Routing.postRegistration
import no.uib.echo.plugins.Routing.putBedpres
import no.uib.echo.schema.BedpresJson
import no.uib.echo.schema.BedpresSlugJson
import no.uib.echo.schema.Degree
import no.uib.echo.schema.RegistrationJson
import no.uib.echo.schema.ShortRegistrationJson
import no.uib.echo.schema.deleteBedpresBySlug
import no.uib.echo.schema.deleteRegistration
import no.uib.echo.schema.insertOrUpdateBedpres
import no.uib.echo.schema.insertRegistration
import no.uib.echo.schema.selectRegistrations

fun Application.configureRouting(authKey: String) {
    install(ContentNegotiation) {
        gson()
    }

    routing {
        getRegistration(authKey)
        postRegistration()
        deleteRegistration(authKey)

        putBedpres(authKey)
        deleteBedpres(authKey)
    }
}

object Routing {
    const val registrationRoute: String = "registration"
    const val bedpresRoute: String = "bedpres"

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

    fun Route.postRegistration() {
        post("/$registrationRoute") {
            try {
                val registration = call.receive<RegistrationJson>()

                if (!registration.email.contains('@')) {
                    call.respond(HttpStatusCode.BadRequest, "Email is not valid.")
                    return@post
                }

                if (registration.degreeYear !in 1..5) {
                    call.respond(HttpStatusCode.BadRequest, "Degree year is not valid.")
                    return@post
                }

                if ((registration.degree == Degree.DTEK ||
                        registration.degree == Degree.DSIK ||
                        registration.degree == Degree.DVIT ||
                        registration.degree == Degree.BINF ||
                        registration.degree == Degree.IMØ ||
                        registration.degree == Degree.IKT ||
                        registration.degree == Degree.KOGNI ||
                        registration.degree == Degree.ÅRMNINF) && registration.degreeYear !in 1..3
                ) {
                    call.respond(HttpStatusCode.BadRequest, "Degree and degree year do not match (bachelor).")
                    return@post
                }

                if ((registration.degree == Degree.INF || registration.degree == Degree.PROG) && (registration.degreeYear !in 4..5)) {
                    call.respond(HttpStatusCode.BadRequest, "Degree and degree year do not match (master).")
                    return@post
                }

                if (registration.degree == Degree.ÅRMNINF && registration.degreeYear != 1) {
                    call.respond(HttpStatusCode.BadRequest, "Degree and degree year do not match (ÅRMNINF).")
                    return@post
                }

                if (registration.degree == Degree.KOGNI && registration.degreeYear != 3) {
                    call.respond(HttpStatusCode.BadRequest, "Degree and degree year do not match (KOGNI).")
                    return@post
                }

                if (!registration.terms) {
                    call.respond(HttpStatusCode.BadRequest, "Terms not accepted.")
                    return@post
                }

                try {
                    insertRegistration(registration)
                } catch (e: Exception) {
                    call.respond(HttpStatusCode.UnprocessableEntity, "Registration already exists.")
                    return@post
                }

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

    fun Route.putBedpres(authKey: String) {
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
}