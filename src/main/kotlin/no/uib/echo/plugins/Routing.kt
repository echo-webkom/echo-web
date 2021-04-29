package no.uib.echo.plugins

import io.ktor.routing.*
import io.ktor.application.*
import io.ktor.gson.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import no.uib.echo.Bedpres
import no.uib.echo.Bedpres.slug
import no.uib.echo.Bedpres.spots
import no.uib.echo.BedpresJson
import no.uib.echo.BedpresSlugJson
import no.uib.echo.Degree
import no.uib.echo.Registration
import no.uib.echo.Registration.email
import no.uib.echo.Registration.bedpresSlug
import no.uib.echo.Registration.degree
import no.uib.echo.Registration.degreeYear
import no.uib.echo.Registration.firstName
import no.uib.echo.Registration.lastName
import no.uib.echo.Registration.terms
import no.uib.echo.RegistrationJson
import no.uib.echo.ShortRegistrationJson
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.joda.time.DateTime

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

fun getQuery(emailParam: String?, slugParam: String?): Query? {
    if (emailParam != null && slugParam != null) {
        return Registration.select { email eq emailParam and (bedpresSlug eq slugParam) }
    } else if (emailParam != null && slugParam == null) {
        return Registration.select { email eq emailParam }
    } else if (emailParam == null && slugParam != null) {
        return Registration.select { bedpresSlug eq slugParam }
    }
    return null
}

fun Route.getRegistration(authKey: String) {
    get("/$registrationRoute") {
        val emailParam: String? = call.request.queryParameters["email"]
        val slugParam: String? = call.request.queryParameters["slug"]
        val auth: String? = call.request.header(HttpHeaders.Authorization)

        if (auth != authKey) {
            call.respond(HttpStatusCode.Unauthorized, "Not authorized.")
            return@get
        }

        val q = getQuery(emailParam, slugParam)

        if (q != null) {
            val result = transaction {
                addLogger(StdOutSqlLogger)

                q.toList()
            }

            call.respond(result.map { reg ->
                RegistrationJson(
                    reg[email],
                    reg[firstName],
                    reg[lastName],
                    Degree.valueOf(reg[degree]),
                    reg[degreeYear],
                    reg[bedpresSlug],
                    reg[terms]
                )
            })
        } else {
            call.respond(HttpStatusCode.BadRequest, "No email or slug given.")
        }
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


            transaction {
                addLogger(StdOutSqlLogger)

                Registration.insert {
                    it[email] = registration.email
                    it[firstName] = registration.firstName
                    it[lastName] = registration.lastName
                    it[degree] = registration.degree.toString()
                    it[degreeYear] = registration.degreeYear
                    it[bedpresSlug] = registration.slug
                    it[terms] = registration.terms
                }
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
            transaction {
                addLogger(StdOutSqlLogger)

                Registration.deleteWhere { bedpresSlug eq shortReg.slug and (email eq shortReg.email) }
            }

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
            val newBedpres = call.receive<BedpresJson>()

            val bedpresList = transaction {
                addLogger(StdOutSqlLogger)

                Bedpres.select { slug eq newBedpres.slug }.toList()
            }

            if (bedpresList.isEmpty()) {
                transaction {
                    addLogger(StdOutSqlLogger)

                    Bedpres.insert {
                        it[slug] = newBedpres.slug
                        it[spots] = newBedpres.spots
                        it[registrationDate] = DateTime(newBedpres.registrationDate)
                    }
                }

                call.respond(HttpStatusCode.OK, "Bedpres submitted.")
                return@put
            }

            val bedpres = bedpresList[0]

            if (bedpres[slug] == newBedpres.slug && bedpres[spots] == newBedpres.spots) {
                call.respond(HttpStatusCode.Accepted, "Bedpres has already been submitted.")
            } else if (bedpres[slug] == newBedpres.slug) {
                transaction {
                    addLogger(StdOutSqlLogger)

                    Bedpres.update({ slug eq newBedpres.slug }) {
                        it[spots] = newBedpres.spots
                    }
                }

                call.respond(
                    HttpStatusCode.OK,
                    "Updated bedpres with slug = ${newBedpres.slug} to spots = ${newBedpres.spots}."
                )
            }
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

        transaction {
            addLogger(StdOutSqlLogger)

            Bedpres.deleteWhere { Bedpres.slug eq slug.slug }
        }

        call.respond(HttpStatusCode.OK, "Bedpres with slug = ${slug.slug} deleted.")
    }
}