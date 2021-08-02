package no.uib.echo.schema

import no.uib.echo.schema.Answer.answer
import no.uib.echo.schema.Answer.bedpresSlug
import no.uib.echo.schema.Answer.question
import no.uib.echo.schema.Answer.registrationEmail
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.jodatime.*
import org.jetbrains.exposed.sql.transactions.transaction
import org.joda.time.DateTime

enum class RegistrationStatus {
    ACCEPTED,
    ALREADY_EXISTS,
    BEDPRES_DOESNT_EXIST,
    WAITLIST,
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
    val answers: List<AnswerJson>
)

data class ShortRegistrationJson(val slug: String, val email: String)

object Registration : Table() {
    val email: Column<String> = varchar("email", 50)
    val firstName: Column<String> = varchar("first_name", 50)
    val lastName: Column<String> = varchar("last_name", 50)
    val degree: Column<String> = varchar("degree", 50)
    val degreeYear: Column<Int> = integer("degree_year")
    val bedpresSlug: Column<String> = varchar("bedpres_slug", 50) references Bedpres.slug
    val terms: Column<Boolean> = bool("terms")
    val submitDate: Column<DateTime> = datetime("submit_date").defaultExpression(CurrentDateTime())
    val waitList: Column<Boolean> = bool("wait_list")

    override val primaryKey: PrimaryKey = PrimaryKey(email, bedpresSlug)
}

fun selectRegistrations(
    emailParam: String?,
    slugParam: String?
): List<RegistrationJson>? {
    val result = transaction {
        addLogger(StdOutSqlLogger)

        val query = when {
            emailParam != null && slugParam != null ->
                Registration.select { Registration.email eq emailParam and (Registration.bedpresSlug eq slugParam) }
            slugParam != null ->
                Registration.select { Registration.bedpresSlug eq slugParam }
            emailParam != null ->
                Registration.select { Registration.email eq emailParam }
            else -> null
        }

        query?.toList()
    }

    return (result?.map { reg ->

        RegistrationJson(
            reg[Registration.email],
            reg[Registration.firstName],
            reg[Registration.lastName],
            Degree.valueOf(reg[Registration.degree]),
            reg[Registration.degreeYear],
            reg[Registration.bedpresSlug],
            reg[Registration.terms],
            reg[Registration.submitDate].toString(),
            reg[Registration.waitList],
            selectQuestionsByEmailAndSlug(reg[Registration.email], reg[Registration.bedpresSlug])
        )
    })
}

fun insertRegistration(reg: RegistrationJson): Triple<String?, IntRange?, RegistrationStatus> {
    return transaction {
        addLogger(StdOutSqlLogger)

        val bedpres =
            selectBedpresBySlug(reg.slug) ?: return@transaction Triple(
                null,
                null,
                RegistrationStatus.BEDPRES_DOESNT_EXIST
            )

        if (DateTime(bedpres.registrationDate).isAfterNow)
            return@transaction Triple(bedpres.registrationDate, null, RegistrationStatus.TOO_EARLY)

        val countRegs = Registration.select { Registration.bedpresSlug eq reg.slug }.toList()
        val waitList = countRegs.size >= bedpres.spots

        val oldReg =
            Registration.select { Registration.email eq reg.email and (Registration.bedpresSlug eq bedpres.slug) }
                .firstOrNull()
        if (oldReg != null)
            return@transaction Triple(null, null, RegistrationStatus.ALREADY_EXISTS)

        if (reg.degreeYear !in bedpres.minDegreeYear!!..bedpres.maxDegreeYear!!)
            return@transaction Triple(
                null,
                bedpres.minDegreeYear..bedpres.maxDegreeYear,
                RegistrationStatus.NOT_IN_RANGE
            )

        Registration.insert {
            it[email] = reg.email
            it[firstName] = reg.firstName
            it[lastName] = reg.lastName
            it[degree] = reg.degree.toString()
            it[degreeYear] = reg.degreeYear
            it[bedpresSlug] = reg.slug
            it[terms] = reg.terms
            it[Registration.waitList] = waitList
        }

        if (reg.answers.isNotEmpty()) {
            Answer.batchInsert(reg.answers) { a ->
                this[registrationEmail] = reg.email
                this[bedpresSlug] = reg.slug
                this[question] = a.question
                this[answer] = a.answer
            }
        }

        return@transaction Triple(
            null,
            null,
            if (waitList) RegistrationStatus.WAITLIST else RegistrationStatus.ACCEPTED
        )
    }
}

fun deleteRegistration(shortReg: ShortRegistrationJson) {
    transaction {
        addLogger(StdOutSqlLogger)

        Registration.deleteWhere { Registration.bedpresSlug eq shortReg.slug and (Registration.email eq shortReg.email) }
    }
}
