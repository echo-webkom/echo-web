package no.uib.echo.schema

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.jodatime.CurrentDateTime
import org.jetbrains.exposed.sql.jodatime.datetime
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.joda.time.DateTime

@Serializable
data class FormRegistrationJson(
    val email: String,
    val slug: String,
    val answers: List<AnswerJson>
)

@Serializable
data class FormDeregistrationJson(
    val email: String,
    val slug: String,
    val reason: String,
    val strikes: Int? = null
)

@Serializable
data class RegistrationJson(
    val email: String,
    val alternateEmail: String? = null,
    val name: String,
    val degree: Degree,
    val degreeYear: Int,
    val slug: String,
    val submitDate: String? = null,
    val registrationStatus: Status = Status.REGISTERED,
    val reason: String? = null,
    val deregistrationDate: String? = null,
    val answers: List<AnswerJson> = emptyList(),
    val memberships: List<String> = emptyList()
)
enum class Status {
    REGISTERED, DEREGISTERED, WAITLIST
}

object Registration : Table() {
    val userEmail: Column<String> = text("user_email") references User.email
    val happeningSlug: Column<String> = text("happening_slug") references Happening.slug
    val degree: Column<String> = text("degree")
    val degreeYear: Column<Int> = integer("degree_year")
    val submitDate: Column<DateTime> = datetime("submit_date").defaultExpression(CurrentDateTime)
    val registrationStatus: Column<Status> = enumerationByName("registration_status", 32)
    val reason: Column<String?> = text("deregistration_reason").nullable()
    val deregistrationDate: Column<DateTime?> = datetime("deregistration_date").nullable()

    override val primaryKey: PrimaryKey = PrimaryKey(userEmail, happeningSlug)
}

fun countRegistrationsDegreeYear(
    slug: String,
    range: IntRange,
    status: Status
): Int {
    return transaction {
        Registration.select {
            Registration.happeningSlug eq slug and
                (Registration.degreeYear inList range) and
                (Registration.registrationStatus eq status)
        }.count()
    }.toInt()
}

fun toCsv(regs: List<RegistrationJson>, testing: Boolean = false): String {
    if (regs.isEmpty()) {
        return ""
    }

    val answersHeading =
        when (regs[0].answers.isEmpty()) {
            true ->
                ""

            false ->
                regs[0].answers.fold("") { acc, answerJson ->
                    acc + "," + answerJson.question.replace(",", " ")
                }
        }

    val predOrEmpty: (pred: Boolean, str: String) -> String = { p, s ->
        if (p) "" else s
    }

    return "email,name,degree,degreeYear${predOrEmpty(testing, ",submitDate")},registrationStatus$answersHeading,memberships" +
        regs.joinToString("") { reg ->
            "\n" +
                (reg.alternateEmail?.lowercase() ?: reg.email.lowercase()) + "," +
                reg.name + "," +
                reg.degree.toString() + "," +
                reg.degreeYear.toString() + "," +
                predOrEmpty(testing, reg.submitDate.toString() + ",") +
                reg.registrationStatus.toString() +
                predOrEmpty(reg.answers.isEmpty(), reg.answers.joinToString("") { "," + it.answer }) +
                predOrEmpty(reg.memberships.isEmpty(), reg.memberships.joinToString(";", prefix = ","))
        }
}
