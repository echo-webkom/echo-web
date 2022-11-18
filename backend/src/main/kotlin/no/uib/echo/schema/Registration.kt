package no.uib.echo.schema

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.addLogger
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
    val answers: List<AnswerJson>,
)

@Serializable
data class RegistrationJson(
    val email: String,
    val name: String,
    val degree: Degree,
    val degreeYear: Int,
    val slug: String,
    val submitDate: String? = null,
    val waitList: Boolean? = null,
    val answers: List<AnswerJson>,
)

object Registration : Table() {
    val userEmail: Column<String> = text("user_email") references User.email
    val happeningSlug: Column<String> = text("happening_slug") references Happening.slug
    val degree: Column<String> = text("degree")
    val degreeYear: Column<Int> = integer("degree_year")
    val submitDate: Column<DateTime> = datetime("submit_date").defaultExpression(CurrentDateTime)
    val waitList: Column<Boolean> = bool("wait_list")

    override val primaryKey: PrimaryKey = PrimaryKey(userEmail, happeningSlug)
}

fun countRegistrationsDegreeYear(slug: String, range: IntRange, waitList: Boolean): Int {
    return transaction {
        addLogger(StdOutSqlLogger)

        val usersInRange = User.select {
            User.degreeYear inList range
        }.toList().map { it[User.email] }

        Registration.select {
            Registration.happeningSlug eq slug and
                (Registration.userEmail inList usersInRange) and
                (Registration.waitList eq waitList)
        }.count()
    }.toInt()
}

fun toCsv(regs: List<RegistrationJson>, testing: Boolean = false): String {
    if (regs.isEmpty())
        return ""

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

    return "email,name,degree,degreeYear${predOrEmpty(testing, ",submitDate")},waitList$answersHeading" +
        regs.joinToString("") { reg ->
            "\n" +
                reg.email.lowercase() + "," +
                reg.name + "," +
                reg.degree.toString() + "," +
                reg.degreeYear.toString() + "," +
                predOrEmpty(testing, reg.submitDate.toString() + ",") +
                reg.waitList.toString() +
                predOrEmpty(reg.answers.isEmpty(), reg.answers.joinToString("") { "," + it.answer })
        }
}
