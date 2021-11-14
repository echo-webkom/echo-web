package no.uib.echo.schema

import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

data class AnswerJson(
    val question: String,
    val answer: String
)

object Answer : Table() {
    private val id: Column<Int> = integer("id").uniqueIndex().autoIncrement()
    val registrationEmail: Column<String> = text("registration_email")
    val question: Column<String> = text("question")
    val answer: Column<String> = text("answer")
    val happeningSlug: Column<String> = text("happening_slug") references Happening.slug

    override val primaryKey: PrimaryKey = PrimaryKey(id)
}

fun getAnswers(email: String, slug: String): List<AnswerJson> {
    val answers = transaction {
        addLogger(StdOutSqlLogger)

        Answer.select {
            Answer.registrationEmail.lowerCase() eq email.lowercase() and
                    (Answer.happeningSlug eq slug)
        }.toList()
    }

    return answers.map {
        AnswerJson(
            it[Answer.question],
            it[Answer.answer]
        )
    }
}
