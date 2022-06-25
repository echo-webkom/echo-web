package no.uib.echo.schema

import kotlinx.serialization.Serializable
import no.uib.echo.schema.Registration.happeningSlug
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
data class RegistrationJson(
    val email: String,
    val firstName: String,
    val lastName: String,
    val degree: Degree,
    val degreeYear: Int,
    val slug: String,
    val terms: Boolean,
    val submitDate: String? = null,
    val waitList: Boolean? = null,
    val answers: List<AnswerJson>,
    val type: HAPPENING_TYPE,
    val regVerifyToken: String? = null,
)

object Registration : Table() {
    val email: Column<String> = text("email")
    val firstName: Column<String> = text("first_name")
    val lastName: Column<String> = text("last_name")
    val degree: Column<String> = text("degree")
    val degreeYear: Column<Int> = integer("degree_year")
    val happeningSlug: Column<String> = text("happening_slug") references Happening.slug
    val terms: Column<Boolean> = bool("terms")
    val submitDate: Column<DateTime> = datetime("submit_date").defaultExpression(CurrentDateTime)
    val waitList: Column<Boolean> = bool("wait_list")

    override val primaryKey: PrimaryKey = PrimaryKey(email, happeningSlug)
}

fun countRegistrationsDegreeYear(slug: String, range: IntRange, waitList: Boolean): Int {
    return transaction {
        addLogger(StdOutSqlLogger)

        Registration.select {
            happeningSlug eq slug and
                (Registration.degreeYear inList range) and
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

    return "email,firstName,lastName,degree,degreeYear${predOrEmpty(testing, ",submitDate")},waitList$answersHeading" +
        regs.joinToString("") { reg ->
            "\n" +
                reg.email.lowercase() + "," +
                reg.firstName + "," +
                reg.lastName + "," +
                reg.degree.toString() + "," +
                reg.degreeYear.toString() + "," +
                predOrEmpty(testing, reg.submitDate.toString() + ",") +
                reg.waitList.toString() +
                predOrEmpty(reg.answers.isEmpty(), reg.answers.joinToString("") { "," + it.answer })
        }
}
