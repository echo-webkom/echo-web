package no.uib.echo.schema

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table

enum class ReactionType {
    LIKE,
    ROCKET,
    BEER,
    EYES,
    FIX,
}

@Serializable
data class ReactionsJson(
    val like: Int,
    val rocket: Int,
    val beer: Int,
    val eyes: Int,
    val fix: Int
)

object Reaction : Table() {
    val userEmail: Column<String> = text("user_email") references User.email
    val happeningSlug: Column<String> = text("happening_slug") references Happening.slug
    val reaction: Column<String> = text("reaction")

    override val primaryKey = PrimaryKey(userEmail, happeningSlug)
}
