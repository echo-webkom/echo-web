package no.uib.echo.plugins

import guru.zoroark.ratelimit.RateLimit
import guru.zoroark.ratelimit.rateLimited
import io.ktor.routing.*
import io.ktor.application.*
import io.ktor.auth.Authentication
import io.ktor.auth.UserIdPrincipal
import io.ktor.auth.authenticate
import io.ktor.auth.basic
import io.ktor.gson.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import no.uib.echo.Response
import no.uib.echo.resToJson
import no.uib.echo.plugins.Routing.deleteBedpres
import no.uib.echo.plugins.Routing.deleteRegistration
import no.uib.echo.plugins.Routing.getRegistration
import no.uib.echo.plugins.Routing.getStatus
import no.uib.echo.plugins.Routing.postRegistration
import no.uib.echo.plugins.Routing.putBedpres
import no.uib.echo.schema.BedpresJson
import no.uib.echo.schema.BedpresSlugJson
import no.uib.echo.schema.Degree
import no.uib.echo.schema.RegistrationJson
import no.uib.echo.schema.RegistrationStatus
import no.uib.echo.schema.ShortRegistrationJson
import no.uib.echo.schema.deleteBedpresBySlug
import no.uib.echo.schema.deleteRegistration
import no.uib.echo.schema.insertOrUpdateBedpres
import no.uib.echo.schema.insertRegistration
import no.uib.echo.schema.selectRegistrations

fun Application.configureRouting(keys: Map<String, String>) {
    val bedkom = "bedkom"
    val webkom = "webkom"

    install(ContentNegotiation) {
        gson()
    }

    install(RateLimit) {
        limit = 200
    }

    install(Authentication) {
        basic("auth-${bedkom}") {
            realm = "Access to registrations."
            validate { credentials ->
                if (credentials.name == bedkom && credentials.password == keys[bedkom])
                    UserIdPrincipal(credentials.name)
                else
                    null
            }
        }

        basic("auth-${webkom}") {
            realm = "Access to bedpreses."
            validate { credentials ->
                if (credentials.name == webkom && credentials.password == keys[webkom])
                    UserIdPrincipal(credentials.name)
                else
                    null
            }
        }
    }

    routing {
        rateLimited {
            getStatus()

            authenticate("auth-${bedkom}") {
                getRegistration()
                deleteRegistration()
            }
            postRegistration()

            authenticate("auth-${webkom}") {
                putBedpres()
                deleteBedpres()
            }
        }
    }
}

object Routing {
    const val registrationRoute: String = "registration"
    const val bedpresRoute: String = "bedpres"

    fun Route.getStatus() {
        get("/status") {
            call.respond(HttpStatusCode.OK)
        }
    }

    fun Route.getRegistration() {
        get("/$registrationRoute") {
            val emailParam: String? = call.request.queryParameters["email"]
            val slugParam: String? = call.request.queryParameters["slug"]

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
                    call.respond(HttpStatusCode.BadRequest, resToJson(Response.InvalidEmail))
                    return@post
                }

                if (registration.degreeYear !in 1..5) {
                    call.respond(HttpStatusCode.BadRequest, resToJson(Response.InvalidDegreeYear))
                    return@post
                }

                if ((registration.degree == Degree.DTEK ||
                        registration.degree == Degree.DSIK ||
                        registration.degree == Degree.DVIT ||
                        registration.degree == Degree.BINF ||
                        registration.degree == Degree.IMO ||
                        registration.degree == Degree.IKT ||
                        registration.degree == Degree.KOGNI ||
                        registration.degree == Degree.ARMNINF) && registration.degreeYear !in 1..3
                ) {
                    call.respond(HttpStatusCode.BadRequest, resToJson(Response.DegreeMismatchBachelor))
                    return@post
                }

                if ((registration.degree == Degree.INF || registration.degree == Degree.PROG) && (registration.degreeYear !in 4..5)) {
                    call.respond(HttpStatusCode.BadRequest, resToJson(Response.DegreeMismatchMaster))
                    return@post
                }

                if (registration.degree == Degree.ARMNINF && registration.degreeYear != 1) {
                    call.respond(HttpStatusCode.BadRequest, resToJson(Response.DegreeMismatchArmninf))
                    return@post
                }

                if (registration.degree == Degree.KOGNI && registration.degreeYear != 3) {
                    call.respond(HttpStatusCode.BadRequest, resToJson(Response.DegreeMismatchKogni))
                    return@post
                }

                if (!registration.terms) {
                    call.respond(HttpStatusCode.BadRequest, resToJson(Response.InvalidTerms))
                    return@post
                }

                val (regDate, degreeYearRange, regStatus) = insertRegistration(registration)

                when (regStatus) {
                    RegistrationStatus.ACCEPTED ->
                        call.respond(HttpStatusCode.OK, resToJson(Response.OK))
                    RegistrationStatus.WAITLIST ->
                        call.respond(HttpStatusCode.Accepted, resToJson(Response.WaitList))
                    RegistrationStatus.TOO_EARLY ->
                        call.respond(HttpStatusCode.Forbidden, resToJson(Response.TooEarly, date = regDate))
                    RegistrationStatus.ALREADY_EXISTS ->
                        call.respond(HttpStatusCode.UnprocessableEntity, resToJson(Response.AlreadySubmitted))
                    RegistrationStatus.BEDPRES_DOESNT_EXIST ->
                        call.respond(HttpStatusCode.Conflict, resToJson(Response.BedpresDosntExist))
                    RegistrationStatus.NOT_IN_RANGE ->
                        call.respond(
                            HttpStatusCode.Forbidden,
                            resToJson(Response.NotInRange, degreeYearRange = degreeYearRange)
                        )
                }
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError)
                e.printStackTrace()
            }
        }
    }

    fun Route.deleteRegistration() {
        delete("/$registrationRoute") {
            try {
                val shortReg = call.receive<ShortRegistrationJson>()

                deleteRegistration(shortReg)

                call.respond(
                    HttpStatusCode.OK,
                    "Registration with email = ${shortReg.email} and slug = ${shortReg.slug} deleted."
                )
            } catch (e: Exception) {
                call.respond(HttpStatusCode.BadRequest, "Error deleting registration.")
                e.printStackTrace()
            }
        }
    }

    fun Route.putBedpres() {
        put("/$bedpresRoute") {
            try {
                val bedpres = call.receive<BedpresJson>()
                val result = insertOrUpdateBedpres(bedpres)

                call.respond(result.first, result.second)
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, "Error submitting bedpres.")
                e.printStackTrace()
            }
        }
    }

    fun Route.deleteBedpres() {
        delete("/$bedpresRoute") {
            val slug = call.receive<BedpresSlugJson>()

            deleteBedpresBySlug(slug)

            call.respond(HttpStatusCode.OK, "Bedpres with slug = ${slug.slug} deleted.")
        }
    }
}
