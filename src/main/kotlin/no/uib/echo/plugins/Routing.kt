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
import no.uib.echo.FullRegistrationJson
import no.uib.echo.Registration
import no.uib.echo.Registration.bedpresSlug
import no.uib.echo.Registration.studentEmail
import no.uib.echo.Registration.terms
import no.uib.echo.RegistrationJson
import no.uib.echo.Student
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

fun Application.configureRouting() {
    install(ContentNegotiation) {
        gson()
    }

    val dbHost = environment.config.propertyOrNull("ktor.db_host")?.getString()
        ?: throw Exception("No DB_HOST specified.")

    routing {
        getRegistration(dbHost)
        submitRegistraiton(dbHost)
        deleteRegistraiton(dbHost)

        submitBedpres(dbHost)
    }
}

private const val registrationRoute: String = "registration"
private const val bedpresRoute: String = "bedpres"

fun Route.getRegistration(dbHost: String) {
    get("/$registrationRoute") {
        val email: String? = call.request.queryParameters["email"]
        val slug: String? = call.request.queryParameters["slug"]

        fun getQuery(email: String?, slug: String?): Query? {
            if (email != null && slug != null) {
                return Registration.select { Registration.studentEmail eq email and (Registration.bedpresSlug eq slug) }
            } else if (email != null && slug == null) {
                return Registration.select { Registration.studentEmail eq email }
            } else if (email == null && slug != null) {
                return Registration.select { Registration.bedpresSlug eq slug }
            }
            return null
        }

        val q = getQuery(email, slug)

        if (q != null) {
            val result = transaction {
                addLogger(StdOutSqlLogger)

                q.toList()
            }

            call.respond(result.map { reg -> RegistrationJson(reg[studentEmail], reg[bedpresSlug], reg[terms]) })
        } else
            call.respond(HttpStatusCode.BadRequest, "No email or slug given.")
    }
}

fun Route.submitRegistraiton(dbHost: String) {
    post("/$registrationRoute") {
        try {
            val registration = call.receive<FullRegistrationJson>()

            transaction(Db.connection(dbHost)) {
                addLogger(StdOutSqlLogger)

                Student.insert {
                    it[firstName] = registration.firstName
                    it[lastName] = registration.lastName
                    it[email] = registration.email
                    it[degree] = registration.degree.toString()
                }

                Registration.insert {
                    it[studentEmail] = registration.email
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

fun Route.deleteRegistraiton(dbHost: String) {
    delete("/$registrationRoute") {
        val slug: String? = call.request.queryParameters["slug"]
        val email: String? = call.request.queryParameters["email"]

        if (slug != null && email != null) {
            transaction(Db.connection(dbHost)) {
                addLogger(StdOutSqlLogger)

                Registration.deleteWhere { Registration.bedpresSlug eq slug and (Registration.studentEmail eq email) }
            }

            call.respond(HttpStatusCode.OK, "Registration with email = $email and slug = $slug deleted.")
        } else {
            call.respond(HttpStatusCode.BadRequest, "No slug given and/or email given.")
        }

    }
}

fun Route.submitBedpres(dbHost: String) {
    post("/$bedpresRoute") {
        try {
            val bedpres = call.receive<BedpresJson>()

            transaction(Db.connection(dbHost)) {
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