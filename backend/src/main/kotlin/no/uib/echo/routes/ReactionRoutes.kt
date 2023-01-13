package no.uib.echo.routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.put
import io.ktor.server.routing.routing
import no.uib.echo.schema.Happening
import no.uib.echo.schema.Reaction
import no.uib.echo.schema.Reaction.happeningSlug
import no.uib.echo.schema.Reaction.userEmail
import no.uib.echo.schema.ReactionType
import no.uib.echo.schema.ReactionsJson
import no.uib.echo.schema.User
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction

fun Application.reactionRoutes(jwtConfig: String) {
    routing {
        authenticate(jwtConfig) {
            putReaction()
            getReactions()
        }
    }
}

fun Route.getReactions() {
    get("/reaction/{slug}") {
        val email = call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()
        if (email == null) {
            call.respond(HttpStatusCode.Unauthorized)
            return@get
        }

        val slug = call.parameters["slug"]
        if (slug == null) {
            call.respond(HttpStatusCode.BadRequest, "No slug specified.")
            return@get
        }

        val slugExists = transaction {
            Happening.select {
                Happening.slug eq slug
            }.count() > 0
        }
        if (!slugExists) {
            call.respond(HttpStatusCode.NotFound, "No happening with slug $slug.")
            return@get
        }

        val reactions = getReactionsBySlug(slug)
        val reactedTo = getReactedTo(slug, email)

        call.respond(
            HttpStatusCode.OK,
            ReactionsJson(
                reactions[ReactionType.LIKE] ?: 0,
                reactions[ReactionType.ROCKET] ?: 0,
                reactions[ReactionType.BEER] ?: 0,
                reactions[ReactionType.EYES] ?: 0,
                reactions[ReactionType.FIX] ?: 0,
                reactedTo
            )
        )
    }
}

fun Route.putReaction() {
    put("/reaction") {
        val email = call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()
        if (email == null) {
            call.respond(HttpStatusCode.Unauthorized)
            return@put
        }

        val user = transaction {
            User.select {
                User.email eq email
            }.firstOrNull()
        }

        if (user == null) {
            call.respond(HttpStatusCode.NotFound, "User with email not found (email = $email).")
            return@put
        }

        val slug = call.request.queryParameters["slug"]
        val reactionQuery = call.request.queryParameters["reaction"]
        if (slug == null || reactionQuery == null) {
            call.respond(HttpStatusCode.BadRequest, "Bad slug or reaction")
            return@put
        }

        val reaction = ReactionType.valueOf(reactionQuery.uppercase()).name

        val reactionExists = transaction {
            Reaction.select {
                userEmail eq email and (happeningSlug eq slug) and (Reaction.reaction eq reaction)
            }.count() > 0
        }

        if (reactionExists) {
            transaction {
                Reaction.deleteWhere {
                    userEmail eq email and (happeningSlug eq slug) and (Reaction.reaction eq reaction)
                }
            }
        } else {
            transaction {
                Reaction.insert {
                    it[userEmail] = email
                    it[happeningSlug] = slug
                    it[Reaction.reaction] = reaction
                }
            }
        }

        val reactions = getReactionsBySlug(slug)
        val reactedTo = getReactedTo(slug, email)

        call.respond(
            HttpStatusCode.OK,
            ReactionsJson(
                reactions[ReactionType.LIKE] ?: 0,
                reactions[ReactionType.ROCKET] ?: 0,
                reactions[ReactionType.BEER] ?: 0,
                reactions[ReactionType.EYES] ?: 0,
                reactions[ReactionType.FIX] ?: 0,
                reactedTo
            )
        )
    }
}

fun getReactionsBySlug(slug: String): Map<ReactionType, Int> {
    val reactions: Map<ReactionType, Int> = transaction {
        Reaction.select {
            happeningSlug eq slug
        }.groupBy {
            ReactionType.valueOf(it[Reaction.reaction])
        }.mapValues {
            it.value.count()
        }
    }

    return reactions
}

fun getReactedTo(slug: String, email: String): List<ReactionType> {
    val reactions: List<ReactionType> = transaction {
        Reaction.select {
            userEmail eq email and (happeningSlug eq slug)
        }.map {
            ReactionType.valueOf(it[Reaction.reaction])
        }.toList()
    }

    return reactions
}
