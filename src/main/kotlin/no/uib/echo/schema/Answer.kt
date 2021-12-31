package no.uib.echo.schema

import org.jetbrains.exposed.sql.*

data class AnswerJson(
    val question: String,
    val answer: String
)

object Answer : Table() {
    private val id: Column<Int> = integer("id").uniqueIndex().autoIncrement()
    val registrationEmail: Column<String> = text("registration_email")
    val question: Column<String> = text("question")
    val answer: Column<String> = text("answer")
    val happeningSlug: Column<String> = text("happening_slug")

    override val primaryKey: PrimaryKey = PrimaryKey(id)

    init {
        foreignKey(
            happeningSlug to Registration.happeningSlug,
            registrationEmail to Registration.email,
            onUpdate = ReferenceOption.RESTRICT,
            onDelete = ReferenceOption.RESTRICT
        )
    }
}
