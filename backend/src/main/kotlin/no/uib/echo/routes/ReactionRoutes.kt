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
import io.ktor.server.routing.post
import io.ktor.server.routing.routing
import no.uib.echo.schema.Happening
import no.uib.echo.schema.Reaction
import no.uib.echo.schema.ReactionType
import no.uib.echo.schema.ReactionsJson
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction

fun Application.reactionRoutes(dev: Boolean) {
    routing {
        authenticate("auth-jwt", optional = dev) {
            postReaction()
        }
        getReactions()
    }
}

fun Route.getReactions() {
    get("/reaction/{slug}") {
        val slug = call.parameters["slug"]
        if (slug == null) {
            call.respond(HttpStatusCode.BadRequest, "No slug specified.")
            return@get
        }

        val slugExists = transaction {
            addLogger(StdOutSqlLogger)
            Happening.select {
                Happening.slug eq slug
            }.count() > 0
        }
        if (!slugExists) {
            call.respond(HttpStatusCode.NotFound, "No happening with slug $slug.")
            return@get
        }

        val reactions = getReactionsBySlug(slug)

        call.respond(
            HttpStatusCode.OK,
            ReactionsJson(
                reactions[ReactionType.LIKE] ?: 0,
                reactions[ReactionType.ROCKET] ?: 0,
                reactions[ReactionType.BEER] ?: 0,
                reactions[ReactionType.EYES] ?: 0,
                reactions[ReactionType.FIX] ?: 0
            )
        )
    }
}

fun Route.postReaction() {
    post("/reaction/{slug}/{reaction}") {
        val email = call.principal<JWTPrincipal>()?.payload?.getClaim("email")?.asString()?.lowercase()
        if (email == null) {
            call.respond(HttpStatusCode.Unauthorized, "No email specified.")
            return@post
        }

        val slug = call.parameters["slug"]
        val reactionParam = call.parameters["reaction"]
        if (slug == null || reactionParam == null) {
            call.respond(HttpStatusCode.BadRequest, "Bad slug or reaction")
            return@post
        }

        val reaction = ReactionType.valueOf(reactionParam.uppercase()).name

        val reactionExists = transaction {
            addLogger(StdOutSqlLogger)
            Reaction.select {
                Reaction.userEmail eq email and (Reaction.happeningSlug eq slug) and (Reaction.reaction eq reaction)
            }.count() > 0
        }

        if (reactionExists) {
            transaction {
                addLogger(StdOutSqlLogger)
                Reaction.deleteWhere {
                    userEmail eq email and (happeningSlug eq slug) and (Reaction.reaction eq reaction)
                }
            }
        } else {
            transaction {
                addLogger(StdOutSqlLogger)

                Reaction.insert {
                    it[userEmail] = email
                    it[happeningSlug] = slug
                    it[Reaction.reaction] = reaction
                }
            }
        }

        val reactions = getReactionsBySlug(slug)

        call.respond(
            HttpStatusCode.OK,
            ReactionsJson(
                reactions[ReactionType.LIKE] ?: 0,
                reactions[ReactionType.ROCKET] ?: 0,
                reactions[ReactionType.BEER] ?: 0,
                reactions[ReactionType.EYES] ?: 0,
                reactions[ReactionType.FIX] ?: 0
            )
        )
    }
}

fun getReactionsBySlug(slug: String): Map<ReactionType, Int> {
    val reactions: Map<ReactionType, Int> = transaction {
        addLogger(StdOutSqlLogger)

        Reaction.select {
            Reaction.happeningSlug eq slug
        }.groupBy {
            ReactionType.valueOf(it[Reaction.reaction])
        }.mapValues {
            it.value.count()
        }
    }

    return reactions
}
