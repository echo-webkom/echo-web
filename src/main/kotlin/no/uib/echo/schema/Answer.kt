package no.uib.echo.schema

import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

data class AnswerJson(
    val question: String,
    val answer: String
)

object BedpresAnswer : Table() {
    val question: Column<String> = text("question")
    val answer: Column<String> = text("answer")
    val bedpresSlug: Column<String> = text("bedpres_slug") references Bedpres.slug
    val registrationEmail: Column<String> = text("registration_email")
}

object EventAnswer : Table() {
    val question: Column<String> = text("question")
    val answer: Column<String> = text("answer")
    val eventSlug: Column<String> = text("event_slug") references Event.slug
    val registrationEmail: Column<String> = text("registration_email")
}

fun selectHappeningQuestionsByEmailAndSlug(email: String, slug: String, type: HAPPENING_TYPE): List<AnswerJson> {
    val result = transaction {
        addLogger(StdOutSqlLogger)

        when (type) {
            HAPPENING_TYPE.BEDPRES ->
                BedpresAnswer.select { BedpresAnswer.registrationEmail eq email and (BedpresAnswer.bedpresSlug eq slug) }
                    .toList()
            HAPPENING_TYPE.EVENT ->
                EventAnswer.select { EventAnswer.registrationEmail eq email and (EventAnswer.eventSlug eq slug) }
                    .toList()
        }
    }

    return when (type) {
        HAPPENING_TYPE.BEDPRES ->
            result.map { q -> AnswerJson(q[BedpresAnswer.question], q[BedpresAnswer.answer]) }
        HAPPENING_TYPE.EVENT ->
            result.map { q ->
                AnswerJson(q[EventAnswer.question], q[EventAnswer.answer])
            }
    }
}