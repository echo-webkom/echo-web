package no.uib.echo.schema

import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

data class AnswerJson(
    val question: String,
    val answer: String
)

object Answer : Table() {
    val id: Column<Int> = integer("id").uniqueIndex().autoIncrement()
    val registrationEmail: Column<String> = text("registration_email")
    val question: Column<String> = text("question")
    val answer: Column<String> = text("answer")
    val happeningSlug: Column<String> = text("happening_slug")
    val happeningType: Column<String> = text("happening_type")

    override val primaryKey: PrimaryKey = PrimaryKey(id)
}

fun selectHappeningQuestions(email: String, slug: String, type: HAPPENING_TYPE): List<AnswerJson> {
    val result = transaction {
        addLogger(StdOutSqlLogger)

        Answer.select {
            Answer.registrationEmail eq email and
                    (Answer.happeningType eq slug) and
                    (Answer.happeningType eq type.toString())
        }.toList()
    }

    return result.map { q -> AnswerJson(q[Answer.question], q[Answer.answer]) }
}
