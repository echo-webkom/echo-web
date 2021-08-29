package no.uib.echo.schema

import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

data class AnswerJson(
    val question: String,
    val answer: String
)

object BedpresAnswer : Table() {
    val question: Column<String> = varchar("question", 50)
    val answer: Column<String> = varchar("answer", 50)
    val bedpresSlug: Column<String> = varchar("bedpres_slug", 50) references Bedpres.slug
    val registrationEmail: Column<String> = varchar("registration_email", 50)
}

object EventAnswer : Table() {
    val question: Column<String> = varchar("question", 50)
    val answer: Column<String> = varchar("answer", 50)
    val eventSlug: Column<String> = varchar("bedpres_slug", 50) references Event.slug
    val registrationEmail: Column<String> = varchar("registration_email", 50)
}

fun selectHappeningQuestionsByEmailAndSlug(email: String, slug: String, type: HAPPENINGTYPE): List<AnswerJson> {
    val result = transaction {
        addLogger(StdOutSqlLogger)

        when (type) {
            HAPPENINGTYPE.BEDPRES ->
                BedpresAnswer.select { BedpresAnswer.registrationEmail eq email and (BedpresAnswer.bedpresSlug eq slug) }
                    .toList()
            HAPPENINGTYPE.EVENT ->
                EventAnswer.select { EventAnswer.registrationEmail eq email and (EventAnswer.eventSlug eq slug) }
                    .toList()
        }
    }

    return when (type) {
        HAPPENINGTYPE.BEDPRES ->
            result.map { q -> AnswerJson(q[BedpresAnswer.question], q[BedpresAnswer.answer]) }
        HAPPENINGTYPE.EVENT ->
            result.map { q ->
                AnswerJson(q[EventAnswer.question], q[EventAnswer.answer])
            }
    }
}