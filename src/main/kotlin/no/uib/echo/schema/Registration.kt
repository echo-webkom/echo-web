package no.uib.echo.schema

import no.uib.echo.schema.Answer.answer
import no.uib.echo.schema.Answer.question
import no.uib.echo.schema.Answer.registrationEmail
import no.uib.echo.schema.SpotRange.maxDegreeYear
import no.uib.echo.schema.SpotRange.minDegreeYear
import no.uib.echo.schema.SpotRange.spots
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.jodatime.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.joda.time.DateTime

enum class RegistrationStatus {
    ACCEPTED,
    ALREADY_EXISTS,
    HAPPENING_DOESNT_EXIST,
    WAIT_LIST,
    TOO_EARLY,
    NOT_IN_RANGE
}

data class RegistrationJson(
    val email: String,
    val firstName: String,
    val lastName: String,
    val degree: Degree,
    val degreeYear: Int,
    val slug: String,
    val terms: Boolean,
    val submitDate: String?,
    val waitList: Boolean,
    val answers: List<AnswerJson>,
    val type: HAPPENING_TYPE
)

data class ShortRegistrationJson(val slug: String, val email: String, val type: HAPPENING_TYPE)

object Registration : Table() {
    val email: Column<String> = text("email")
    val firstName: Column<String> = text("first_name")
    val lastName: Column<String> = text("last_name")
    val degree: Column<String> = text("degree")
    val degreeYear: Column<Int> = integer("degree_year")
    val happeningSlug: Column<String> = text("happening_slug") references Happening.slug
    val terms: Column<Boolean> = bool("terms")
    val submitDate: Column<DateTime> = datetime("submit_date").defaultExpression(CurrentDateTime())
    val waitList: Column<Boolean> = bool("wait_list")

    override val primaryKey: PrimaryKey = PrimaryKey(email, happeningSlug)
}

fun insertRegistration(reg: RegistrationJson): Triple<String?, List<SpotRangeJson>?, RegistrationStatus> {
    return transaction {
        addLogger(StdOutSqlLogger)

        val happening =
            selectHappening(reg.slug) ?: return@transaction Triple(
                null,
                null,
                RegistrationStatus.HAPPENING_DOESNT_EXIST
            )

        if (DateTime(happening.registrationDate).isAfterNow)
            return@transaction Triple(happening.registrationDate, null, RegistrationStatus.TOO_EARLY)

        val oldReg =
            Registration.select {
                Registration.email eq reg.email and
                (Registration.happeningSlug eq happening.slug)
            }.firstOrNull()

        if (oldReg != null)
            return@transaction Triple(null, null, RegistrationStatus.ALREADY_EXISTS)

        val spotRanges = selectSpotRanges(reg.slug)
        val correctRange = whichSpotRange(spotRanges, reg.degreeYear) ?: return@transaction Triple(
            null,
            spotRanges,
            RegistrationStatus.NOT_IN_RANGE
        )

        val countRegs =
            Registration.select {
                Registration.happeningSlug eq reg.slug and
                (Registration.degreeYear inList correctRange.minDegreeYear..correctRange.maxDegreeYear)
            }.count()

        val waitList = countRegs >= correctRange.spots
        val waitListSpot = countRegs - correctRange.spots + 1

        Registration.insert {
            it[email] = reg.email
            it[firstName] = reg.firstName
            it[lastName] = reg.lastName
            it[degree] = reg.degree.toString()
            it[degreeYear] = reg.degreeYear
            it[happeningSlug] = reg.slug
            it[terms] = reg.terms
            it[Registration.waitList] = waitList
        }

        if (reg.answers.isNotEmpty()) {
            Answer.batchInsert(reg.answers) { a ->
                this[registrationEmail] = reg.email
                this[Answer.happeningSlug] = reg.slug
                this[question] = a.question
                this[answer] = a.answer
            }
        }

        if (waitList)
            return@transaction Triple(waitListSpot.toString(), null, RegistrationStatus.WAIT_LIST)
        else
            return@transaction Triple(null, null, RegistrationStatus.ACCEPTED)
    }
}

fun countRegistrationsDegreeYear(slug: String, range: IntRange, waitList: Boolean): Int {
    return transaction {
        addLogger(StdOutSqlLogger)

        Registration.select {
            Registration.happeningSlug eq slug and
            (Registration.degreeYear inList range) and
            (Registration.waitList eq waitList)
        }.count()
    }.toInt()
}

fun countRegistrations(slug: String): List<SpotRangeWithCountJson> {
    return transaction {
        addLogger(StdOutSqlLogger)

        SpotRange.select {
            SpotRange.happeningSlug eq slug
        }.toList().map {
            SpotRangeWithCountJson(
                it[spots],
                it[minDegreeYear],
                it[maxDegreeYear],
                countRegistrationsDegreeYear(slug, it[minDegreeYear]..it[maxDegreeYear], false),
                countRegistrationsDegreeYear(slug, it[minDegreeYear]..it[maxDegreeYear], true)
            )
        }
    }
}

fun deleteRegistration(shortReg: ShortRegistrationJson) {
    transaction {
        addLogger(StdOutSqlLogger)

        Registration.deleteWhere {
            Registration.happeningSlug eq shortReg.slug and
                    (Registration.email eq shortReg.email)
        }
    }
}
