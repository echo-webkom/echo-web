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
import no.uib.echo.Environment
import no.uib.echo.isEmailValid
import no.uib.echo.schema.Degree
import no.uib.echo.schema.StudentGroupMembership
import no.uib.echo.schema.User
import no.uib.echo.schema.UserJson
import no.uib.echo.schema.Whitelist
import no.uib.echo.schema.bachelors
import no.uib.echo.schema.getGroupMembers
import no.uib.echo.schema.getUserStudentGroups
import no.uib.echo.schema.masters
import no.uib.echo.schema.nullableStringToDegree
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.or
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import org.joda.time.DateTime
import java.util.Date

fun Application.userRoutes(
    env: Environment,
    audience: String,
    issuer: String,
    secret: String?,
    jwtConfig: String
) {
    routing {
        getToken(env, audience, issuer, secret)
        authenticate(jwtConfig) {
            getUser()
            postUser()
            putUser()
            getAllUsers()
            getWhitelist()
            putWhitelist()
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
                memberships,
                user[User.strikes],
                user[User.createdAt].toString(),
                user[User.modifiedAt].toString(),
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
                User.select { User.email eq email }.firstOrNull()
            }

            if (existingUser != null) {
                call.respond(HttpStatusCode.Conflict, "User already exists.")
                return@post
            }

            transaction {
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
                User.select { User.email eq email }.firstOrNull()
            }

            if (result == null) {
                val newUser = transaction {
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
                        emptyList(),
                        newUser[User.strikes],
                        newUser[User.createdAt].toString(),
                        newUser[User.modifiedAt].toString(),
                    )
                )
                return@put
            }

            val updatedUser = transaction {
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
                    memberships,
                    updatedUser[User.strikes],
                    updatedUser[User.createdAt].toString(),
                    updatedUser[User.modifiedAt].toString(),
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

        if (email !in getGroupMembers("webkom") && email !in getGroupMembers("bedkom")) {
            call.respond(HttpStatusCode.Forbidden)
            return@get
        }

        val users = transaction {
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
                            .ifEmpty { emptyList() },
                        it[User.strikes],
                        it[User.createdAt].toString(),
                        it[User.modifiedAt].toString(),
                    )
                }
        }

        call.respond(HttpStatusCode.OK, users)
    }
}

/** Used for testing purposes */
fun Route.getToken(env: Environment, audience: String, issuer: String, secret: String?) {
    get("/token/{email}") {
        val email = call.parameters["email"]

        if (email == null) {
            call.respond(HttpStatusCode.BadRequest, "No email supplied")
            return@get
        }

        if (env == Environment.PRODUCTION || secret == null) {
            call.respond(HttpStatusCode.Forbidden, "Only available in dev or preview environment! >:(")
            return@get
        }
        val token =
            JWT.create()
                .withAudience(audience)
                .withIssuer(issuer)
                .withClaim("email", email)
                .withExpiresAt(Date(System.currentTimeMillis() + (1000 * 60 * 60)))
                .sign(Algorithm.HMAC256(secret))
        call.respond(token)
    }
}

fun Route.getWhitelist() {
    get("/user/whitelist") {
        val email =
            call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()

        if (email == null) {
            call.respond(HttpStatusCode.Unauthorized)
            return@get
        }

        val whitelist = transaction {
            Whitelist.select {
                Whitelist.email eq email
            }.firstOrNull()
        }

        if (whitelist == null) {
            call.respond(HttpStatusCode.NotFound)
            return@get
        }

        if (whitelist[Whitelist.expiresAt].isBeforeNow) {
            call.respond(HttpStatusCode.Gone)
            return@get
        }

        call.respond(HttpStatusCode.OK)
    }
}

fun Route.putWhitelist() {
    put("/user/whitelist/{email}") {
        val email =
            call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()

        if (email !in getGroupMembers("webkom")) {
            call.respond(HttpStatusCode.Unauthorized)
            return@put
        }

        val userEmail = call.parameters["email"]
        val days = call.request.queryParameters["days"]

        if (userEmail == null || days == null) {
            call.respond(HttpStatusCode.BadRequest)
            return@put
        }

        transaction {
            Whitelist.insert {
                it[Whitelist.email] = userEmail
                it[expiresAt] = DateTime.now().plusDays(days.toInt())
            }
        }

        call.respond(HttpStatusCode.OK)
    }
}
