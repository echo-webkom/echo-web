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
import no.uib.echo.Student
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

fun Application.configureRouting() {
    routing {
        getRegistration()
        submitRegistraiton()
        deleteRegistraiton()

        submitBedpres()
    }
}

private const val registrationRoute: String = "registration"
private const val bedpresRoute: String = "bedpres"

fun Route.getRegistration() {
    get("/$registrationRoute/{email}/{slug}") {
        val email: String = call.parameters["email"] ?: ""
        val slug: String = call.parameters["slug"] ?: ""

        if (email == "" && slug == "")
            call.respond(HttpStatusCode.BadRequest, "No email or slug given.")
        if (email == "")
            call.respond(HttpStatusCode.BadRequest, "No email given.")
        if (slug == "")
            call.respond(HttpStatusCode.BadRequest, "No slug given.")
        else
            transaction(Db.connection) {
                addLogger(StdOutSqlLogger)

                Registration.select { Registration.studentEmail eq email and (Registration.bedpresSlug eq slug) }
            }
    }
}

fun Route.submitRegistraiton() {
    post("/$registrationRoute") {
        try {
            val registration = call.receive<FullRegistrationJson>()

            transaction(Db.connection) {
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

fun Route.deleteRegistraiton() {
    delete("/$registrationRoute/{slug}") {
        val slug: String = call.parameters["slug"] ?: ""

        if (slug == "")
            call.respond(HttpStatusCode.BadRequest, "No slug given")
        else
            transaction(Db.connection) {
                addLogger(StdOutSqlLogger)

                Bedpres.deleteWhere { Bedpres.slug eq slug }
            }
    }
}

fun Route.submitBedpres() {
    install(ContentNegotiation) {
        gson()
    }

    post("/$bedpresRoute") {
        try {
            val bedpres = call.receive<BedpresJson>()

            transaction(Db.connection) {
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