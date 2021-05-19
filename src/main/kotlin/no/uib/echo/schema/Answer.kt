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
    val question: Column<String> = varchar("question", 50)
    val answer: Column<String> = varchar("answer", 50)
    val bedpresSlug: Column<String> = varchar("bedpres_slug", 50) references Bedpres.slug
    val registrationEmail: Column<String> = varchar("registration_email", 50)
}

fun selectQuestionsByEmailAndSlug(email: String, slug: String): List<AnswerJson> {
    val result = transaction {
        Answer.select { Answer.registrationEmail eq email and (Answer.bedpresSlug eq slug)}.toList()
    }

    return result.map { q -> AnswerJson(q[question], q[answer]) }
}