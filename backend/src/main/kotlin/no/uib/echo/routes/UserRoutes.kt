package no.uib.echo.routes

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.put
import io.ktor.server.routing.routing
import no.uib.echo.isEmailValid
import no.uib.echo.schema.Degree
import no.uib.echo.schema.StudentGroupMembership
import no.uib.echo.schema.User
import no.uib.echo.schema.UserJson
import no.uib.echo.schema.bachelors
import no.uib.echo.schema.getGroupMembers
import no.uib.echo.schema.getUserStudentGroups
import no.uib.echo.schema.masters
import no.uib.echo.schema.nullableStringToDegree
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.or
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import org.joda.time.DateTime
import java.util.Date

fun Application.userRoutes(
    dev: Boolean = false,
    audience: String,
    issuer: String,
    secret: String,
    jwtConfig: String
) {
    routing {
        getToken(dev, audience, issuer, secret)
        authenticate(jwtConfig) {
            getUser()
            postUser()
            putUser()
            getAllUsers()
        }
    }
}

/** Returns the user with the given email. Email is taken from the JWT token. */
fun Route.getUser() {
    get("/user") {
        val email =
            call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()

        if (email == null) {
            call.respond(HttpStatusCode.Unauthorized)
            return@get
        }

        val user = transaction {
            addLogger(StdOutSqlLogger)
            User.select { User.email eq email }.firstOrNull()
        }

        if (user == null) {
            call.respond(HttpStatusCode.NotFound, "User with email not found (email = $email).")
            return@get
        }

        val memberships = getUserStudentGroups(email)

        call.respond(
            HttpStatusCode.OK,
            UserJson(
                user[User.email],
                user[User.name],
                user[User.alternateEmail],
                user[User.degreeYear],
                nullableStringToDegree(user[User.degree]),
                memberships
            )
        )
    }
}

/** Creates a new user with the given email. Email is taken from the JWT token. */
fun Route.postUser() {
    post("/user") {
        val email =
            call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()

        if (email == null) {
            call.respond(HttpStatusCode.Unauthorized)
            return@post
        }

        try {
            val user = call.receive<UserJson>()

            if (user.email.lowercase() != email) {
                call.respond(HttpStatusCode.Forbidden)
                return@post
            }

            val existingUser = transaction {
                addLogger(StdOutSqlLogger)

                User.select { User.email eq email }.firstOrNull()
            }

            if (existingUser != null) {
                call.respond(HttpStatusCode.Conflict, "User already exists.")
                return@post
            }

            transaction {
                addLogger(StdOutSqlLogger)

                User.insert {
                    it[User.email] = email
                    it[name] = user.name
                }
            }

            call.respond(
                HttpStatusCode.OK,
                "New user created with email = $email and name = ${user.name}."
            )
        } catch (e: Exception) {
            call.respond(HttpStatusCode.InternalServerError)
            e.printStackTrace()
        }
    }
}

/** Updates the user with the given email. Email is taken from the JWT token. */
fun Route.putUser() {
    put("/user") {
        val email =
            call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()

        if (email == null) {
            call.respond(
                HttpStatusCode.Unauthorized,
                "Det har skjedd en feil. Vennligst prøv å logg inn og ut igjen."
            )
            return@put
        }

        try {
            val user = call.receive<UserJson>()

            if (user.email.lowercase() != email) {
                call.respond(HttpStatusCode.Forbidden)
                return@put
            }

            val alternateEmail = user.alternateEmail?.lowercase()

            if (!alternateEmail.isNullOrBlank()) {
                if (!isEmailValid(alternateEmail)) {
                    call.respond(HttpStatusCode.BadRequest, "Vennligst skriv inn en gyldig e-post.")
                    return@put
                }
            }

            if (user.degreeYear != null && user.degreeYear !in 1..5) {
                call.respond(HttpStatusCode.BadRequest, "Vennligst velg et gyldig trinn.")
                return@put
            }

            val degreeMismatch = "Studieretning og årstrinn stemmer ikke overens."

            if (user.degree != null && user.degreeYear != null) {
                if ((user.degree in bachelors && user.degreeYear !in 1..3) ||
                    (user.degree in masters && user.degreeYear !in 4..5) ||
                    (user.degree == Degree.ARMNINF && user.degreeYear != 1)
                ) {
                    call.respond(HttpStatusCode.BadRequest, degreeMismatch)
                    return@put
                }
            }

            val result = transaction {
                addLogger(StdOutSqlLogger)
                User.select { User.email eq email }.firstOrNull()
            }

            if (result == null) {
                val newUser = transaction {
                    addLogger(StdOutSqlLogger)
                    User.insert {
                        it[User.email] = email
                        it[name] = user.name
                        it[User.alternateEmail] = alternateEmail
                        it[degree] = user.degree.toString()
                        it[degreeYear] = user.degreeYear
                    }

                    User.select { User.email eq email }.first()
                }
                call.respond(
                    HttpStatusCode.OK,
                    UserJson(
                        newUser[User.email],
                        newUser[User.name],
                        newUser[User.alternateEmail],
                        newUser[User.degreeYear],
                        nullableStringToDegree(newUser[User.degree]),
                        emptyList()
                    )
                )
            }

            val updatedUser = transaction {
                addLogger(StdOutSqlLogger)
                User.update({ User.email eq email }) {
                    it[name] = user.name
                    it[User.alternateEmail] = alternateEmail
                    it[degree] = user.degree.toString()
                    it[degreeYear] = user.degreeYear
                    it[modifiedAt] = DateTime.now()
                }

                User.select { User.email eq email }.first()
            }

            val memberships = getUserStudentGroups(email)

            call.respond(
                HttpStatusCode.OK,
                UserJson(
                    updatedUser[User.email],
                    updatedUser[User.name],
                    updatedUser[User.alternateEmail],
                    updatedUser[User.degreeYear],
                    nullableStringToDegree(updatedUser[User.degree]),
                    memberships
                )
            )
        } catch (e: Exception) {
            call.respond(HttpStatusCode.InternalServerError)
            e.printStackTrace()
        }
    }
}

/** Gets a list of all users. Only available to admins/webkom. */
fun Route.getAllUsers() {
    get("/users") {
        val email =
            call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()

        if (email == null) {
            call.respond(HttpStatusCode.Unauthorized)
            return@get
        }

        if (email !in getGroupMembers("webkom")) {
            call.respond(HttpStatusCode.Forbidden)
            return@get
        }

        val users = transaction {
            addLogger(StdOutSqlLogger)
            User.select { User.email like "%@student.uib.no" or (User.email like "%@uib.no") }
                .map { it ->
                    UserJson(
                        it[User.email],
                        it[User.name],
                        it[User.alternateEmail],
                        it[User.degreeYear],
                        nullableStringToDegree(it[User.degree]),
                        StudentGroupMembership.select {
                            StudentGroupMembership.userEmail eq it[User.email]
                        }
                            .toList()
                            .map { it[StudentGroupMembership.studentGroupName] }
                            .ifEmpty { emptyList() }
                    )
                }
        }

        call.respond(HttpStatusCode.OK, users)
    }
}

/** Used for testing purposes */
fun Route.getToken(dev: Boolean, audience: String, issuer: String, secret: String) {
    get("/token/{email}") {
        val email = call.parameters["email"]

        if (email == null) {
            call.respond(HttpStatusCode.BadRequest, "No email supplied")
            return@get
        }

        if (!dev) {
            call.respond(HttpStatusCode.Forbidden, "Only available in dev mode ! >:(")
            return@get
        }
        val token =
            JWT.create()
                .withAudience(audience)
                .withIssuer(issuer)
                .withClaim("email", email)
                .withExpiresAt(Date(System.currentTimeMillis() + (1000 * 60 * 60)))
                .sign(Algorithm.HMAC256(secret))
        call.respond(hashMapOf("token" to token))
    }
}
