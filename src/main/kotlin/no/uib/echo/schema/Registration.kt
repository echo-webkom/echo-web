package no.uib.echo.schema

import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.jodatime.CurrentDateTime
import org.jetbrains.exposed.sql.jodatime.datetime
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.joda.time.DateTime

enum class RegistrationStatus {
    ACCEPTED,
    ALREADY_EXISTS,
    BEDPRES_DOESNT_EXIST,
    WAITLIST,
    TOO_EARLY
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
    val waitList: Boolean
)

data class ShortRegistrationJson(val slug: String, val email: String)

object Registration : Table() {
    val email: Column<String> = varchar("email", 40)
    val firstName: Column<String> = varchar("firstName", 40)
    val lastName: Column<String> = varchar("lastName", 40)
    val degree: Column<String> = varchar("degree", 50)
    val degreeYear: Column<Int> = integer("degreeYear")
    val bedpresSlug: Column<String> = varchar("bedpresSlug", 40) references Bedpres.slug
    val terms: Column<Boolean> = bool("terms")
    val submitDate: Column<DateTime> = datetime("submitDate").defaultExpression(CurrentDateTime())
    val waitList: Column<Boolean> = bool("waitList")

    override val primaryKey: PrimaryKey = PrimaryKey(email, bedpresSlug)
}

enum class Degree {
    DTEK,
    DSIK,
    DVIT,
    BINF,
    IMO,
    IKT,
    KOGNI,
    INF,
    PROG,
    ARMNINF,
    POST,
    MISC,
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
            reg[Registration.waitList]
        )
    })
}

fun insertRegistration(reg: RegistrationJson): Pair<String?, RegistrationStatus> {
    return transaction {
        addLogger(StdOutSqlLogger)

        val bedpres =
            selectBedpresBySlug(reg.slug) ?: return@transaction Pair(null, RegistrationStatus.BEDPRES_DOESNT_EXIST)

        if (DateTime(bedpres.registrationDate).isAfterNow)
            return@transaction Pair(bedpres.registrationDate, RegistrationStatus.TOO_EARLY)

        val countRegs = Registration.select { Registration.bedpresSlug eq reg.slug }.toList()
        val waitList = countRegs.size >= bedpres.spots

        val oldReg = Registration.select { Registration.email eq reg.email }.firstOrNull()
        if (oldReg != null)
            return@transaction Pair(null, RegistrationStatus.ALREADY_EXISTS)

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

        return@transaction Pair(null, if (waitList) RegistrationStatus.WAITLIST else RegistrationStatus.ACCEPTED)
    }
}

fun deleteRegistration(shortReg: ShortRegistrationJson) {
    transaction {
        addLogger(StdOutSqlLogger)

        Registration.deleteWhere { Registration.bedpresSlug eq shortReg.slug and (Registration.email eq shortReg.email) }
    }
}
