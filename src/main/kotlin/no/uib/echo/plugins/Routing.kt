package no.uib.echo.plugins

import io.ktor.routing.*
import io.ktor.application.*
import io.ktor.gson.*
import io.ktor.features.*
import io.ktor.http.*
import io.ktor.request.*
import io.ktor.response.*
import no.uib.echo.Bedpres
import no.uib.echo.BedpresJson
import no.uib.echo.Db
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
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

fun Application.configureRouting() {
    install(ContentNegotiation) {
        gson()
    }

    val authKey = System.getenv("AUTH_KEY") ?: throw Exception("No AUTH_KEY specified.")

    routing {
        getRegistration(authKey)
        submitRegistraiton()
        deleteRegistraiton(authKey)

        submitBedpres(authKey)
        deleteBedpres(authKey)
    }
}

private const val registrationRoute: String = "registration"
private const val bedpresRoute: String = "bedpres"

fun getQuery(emailParam: String?, slugParam: String?): Query? {
    if (emailParam != null && slugParam != null) {
        return Registration.select { Registration.email eq emailParam and (Registration.bedpresSlug eq slugParam) }
    } else if (emailParam != null && slugParam == null) {
        return Registration.select { Registration.email eq emailParam }
    } else if (emailParam == null && slugParam != null) {
        return Registration.select { Registration.bedpresSlug eq slugParam }
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
            val result = transaction(Db.conn) {
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

fun Route.submitRegistraiton() {
    post("/$registrationRoute") {
        try {
            val registration = call.receive<RegistrationJson>()

            if (!registration.email.contains('@'))
                call.respond(HttpStatusCode.BadRequest, "Email is not valid.")

            if (registration.degreeYear < 1 || registration.degreeYear > 6)
                call.respond(HttpStatusCode.BadRequest, "Degree year is not valid.")

            transaction(Db.conn) {
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

fun Route.deleteRegistraiton(authKey: String) {
    delete("/$registrationRoute") {
        val slugParam: String? = call.request.queryParameters["slug"]
        val emailParam: String? = call.request.queryParameters["email"]
        val auth: String? = call.request.header(HttpHeaders.Authorization)

        if (auth != authKey) {
            call.respond(HttpStatusCode.Unauthorized, "Not authorized.")
            return@delete
        }
        if (slugParam == null && emailParam == null) {
            call.respond(HttpStatusCode.BadRequest, "No slug or email given.")
            return@delete
        }
        if (slugParam == null) {
            call.respond(HttpStatusCode.BadRequest, "No slug given.")
            return@delete
        }
        if (emailParam == null) {
            call.respond(HttpStatusCode.BadRequest, "No email given.")
            System.err.println(emailParam.toString())
            System.err.println(slugParam)
            return@delete
        }

        transaction(Db.conn) {
            addLogger(StdOutSqlLogger)

            Registration.deleteWhere { Registration.bedpresSlug eq slugParam and (Registration.email eq emailParam) }
        }

        call.respond(HttpStatusCode.OK, "Registration with email = $emailParam and slug = $slugParam deleted.")
    }
}

fun Route.submitBedpres(authKey: String) {
    post("/$bedpresRoute") {
        val auth: String? = call.request.header(HttpHeaders.Authorization)

        if (auth != authKey) {
            call.respond(HttpStatusCode.Unauthorized, "Not authorized.")
            return@post
        }

        try {
            val bedpres = call.receive<BedpresJson>()

            transaction(Db.conn) {
                addLogger(StdOutSqlLogger)

                Bedpres.insert {
                    it[slug] = bedpres.slug
                    it[spots] = bedpres.spots
                }
            }

            call.respond(HttpStatusCode.OK, "Bedpres submitted.")
        } catch (e: Exception) {
            call.respond(HttpStatusCode.BadRequest, "Error submitting bedpres.")
            System.err.println(e.printStackTrace())
        }
    }
}

fun Route.deleteBedpres(authKey: String) {
    delete("/$bedpresRoute") {
        val auth: String? = call.request.header(HttpHeaders.Authorization)
        val slugParam: String? = call.request.queryParameters["slug"]

        if (auth != authKey) {
            call.respond(HttpStatusCode.Unauthorized, "Not authorized.")
            return@delete
        }
        if (slugParam == null) {
            call.respond(HttpStatusCode.BadRequest, "No slug specified.")
            return@delete
        }

        println(auth)

        transaction(Db.conn) {
            addLogger(StdOutSqlLogger)

            Bedpres.deleteWhere { Bedpres.slug eq slugParam }
        }
        call.respond(HttpStatusCode.OK, "Bedpres with slug = $slugParam deleted.")
    }
}
