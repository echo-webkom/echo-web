package no.uib.echo.schema

import no.uib.echo.schema.Answer.answer
import no.uib.echo.schema.Answer.question
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

data class AnswerJson(
    val question: String,
    val answer: String
)

object Answer : Table() {
    val question: Column<String> = text("question")
    val answer: Column<String> = text("answer")
    val bedpresSlug: Column<String> = text("bedpres_slug") references Bedpres.slug
    val registrationEmail: Column<String> = text("registration_email")
}

fun selectQuestionsByEmailAndSlug(email: String, slug: String): List<AnswerJson> {
    val result = transaction {
        Answer.select { Answer.registrationEmail eq email and (Answer.bedpresSlug eq slug) }.toList()
    }

    return result.map { q -> AnswerJson(q[question], q[answer]) }
}