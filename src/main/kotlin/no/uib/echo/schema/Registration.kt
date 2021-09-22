package no.uib.echo.schema

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

data class RegistrationCountJson(
    val regCount: Long,
    val waitListCount: Long
)

data class ShortRegistrationJson(val slug: String, val email: String, val type: HAPPENING_TYPE)

object BedpresRegistration : Table() {
    val email: Column<String> = text("email")
    val firstName: Column<String> = text("first_name")
    val lastName: Column<String> = text("last_name")
    val degree: Column<String> = text("degree")
    val degreeYear: Column<Int> = integer("degree_year")
    val bedpresSlug: Column<String> = text("bedpres_slug") references Bedpres.slug
    val terms: Column<Boolean> = bool("terms")
    val submitDate: Column<DateTime> = datetime("submit_date").defaultExpression(CurrentDateTime())
    val waitList: Column<Boolean> = bool("wait_list")

    override val primaryKey: PrimaryKey = PrimaryKey(email, bedpresSlug)
}

object EventRegistration : Table() {
    val email: Column<String> = text("email")
    val firstName: Column<String> = text("first_name")
    val lastName: Column<String> = text("last_name")
    val degree: Column<String> = text("degree")
    val degreeYear: Column<Int> = integer("degree_year")
    val eventSlug: Column<String> = text("event_slug") references Event.slug
    val terms: Column<Boolean> = bool("terms")
    val submitDate: Column<DateTime> = datetime("submit_date").defaultExpression(CurrentDateTime())
    val waitList: Column<Boolean> = bool("wait_list")

    override val primaryKey: PrimaryKey = PrimaryKey(email, eventSlug)
}

fun selectRegistrations(
    emailParam: String?,
    slugParam: String?,
    type: HAPPENING_TYPE
): List<RegistrationJson>? {
    val result = transaction {
        addLogger(StdOutSqlLogger)

        val query = when {
            emailParam != null && slugParam != null ->
                when (type) {
                    HAPPENING_TYPE.BEDPRES ->
                        BedpresRegistration.select { BedpresRegistration.email eq emailParam and (BedpresRegistration.bedpresSlug eq slugParam) }
                    HAPPENING_TYPE.EVENT ->
                        EventRegistration.select { EventRegistration.email eq emailParam and (EventRegistration.eventSlug eq slugParam) }
                }
            slugParam != null ->
                when (type) {
                    HAPPENING_TYPE.BEDPRES ->
                        BedpresRegistration.select { BedpresRegistration.bedpresSlug eq slugParam }
                    HAPPENING_TYPE.EVENT ->
                        EventRegistration.select { EventRegistration.eventSlug eq slugParam }
                }
            emailParam != null ->
                when (type) {
                    HAPPENING_TYPE.BEDPRES ->
                        BedpresRegistration.select { BedpresRegistration.email eq emailParam }
                    HAPPENING_TYPE.EVENT ->
                        EventRegistration.select { EventRegistration.email eq emailParam }
                }
            else -> null
        }

        query?.toList()
    }

    return when (type) {
        HAPPENING_TYPE.BEDPRES ->
            (result?.map { reg ->
                RegistrationJson(
                    reg[BedpresRegistration.email],
                    reg[BedpresRegistration.firstName],
                    reg[BedpresRegistration.lastName],
                    Degree.valueOf(reg[BedpresRegistration.degree]),
                    reg[BedpresRegistration.degreeYear],
                    reg[BedpresRegistration.bedpresSlug],
                    reg[BedpresRegistration.terms],
                    reg[BedpresRegistration.submitDate].toString(),
                    reg[BedpresRegistration.waitList],
                    selectHappeningQuestionsByEmailAndSlug(
                        reg[BedpresRegistration.email],
                        reg[BedpresRegistration.bedpresSlug],
                        type
                    ),
                    type
                )
            })
        HAPPENING_TYPE.EVENT ->
            (result?.map { reg ->
                RegistrationJson(
                    reg[EventRegistration.email],
                    reg[EventRegistration.firstName],
                    reg[EventRegistration.lastName],
                    Degree.valueOf(reg[EventRegistration.degree]),
                    reg[EventRegistration.degreeYear],
                    reg[EventRegistration.eventSlug],
                    reg[EventRegistration.terms],
                    reg[EventRegistration.submitDate].toString(),
                    reg[EventRegistration.waitList],
                    selectHappeningQuestionsByEmailAndSlug(
                        reg[EventRegistration.email],
                        reg[EventRegistration.eventSlug],
                        type
                    ),
                    type
                )
            })
    }
}

fun insertRegistration(reg: RegistrationJson): Triple<String?, IntRange?, RegistrationStatus> {
    return transaction {
        addLogger(StdOutSqlLogger)

        val happening =
            selectHappeningBySlug(reg.slug, reg.type) ?: return@transaction Triple(
                null,
                null,
                RegistrationStatus.HAPPENING_DOESNT_EXIST
            )

        if (DateTime(happening.registrationDate).isAfterNow)
            return@transaction Triple(happening.registrationDate, null, RegistrationStatus.TOO_EARLY)

        val countRegs = when (reg.type) {
            HAPPENING_TYPE.BEDPRES ->
                BedpresRegistration.select { BedpresRegistration.bedpresSlug eq reg.slug }.count()
            HAPPENING_TYPE.EVENT ->
                EventRegistration.select { EventRegistration.eventSlug eq reg.slug }.count()
        }

        val waitList = countRegs >= happening.spots
        val waitListSpot = countRegs - happening.spots + 1

        val oldReg = when (reg.type) {
            HAPPENING_TYPE.BEDPRES ->
                BedpresRegistration.select { BedpresRegistration.email eq reg.email and (BedpresRegistration.bedpresSlug eq happening.slug) }
                    .firstOrNull()
            HAPPENING_TYPE.EVENT ->
                EventRegistration.select { EventRegistration.email eq reg.email and (EventRegistration.eventSlug eq happening.slug) }
                    .firstOrNull()
        }
        if (oldReg != null)
            return@transaction Triple(null, null, RegistrationStatus.ALREADY_EXISTS)

        if (reg.degreeYear !in happening.minDegreeYear!!..happening.maxDegreeYear!!)
            return@transaction Triple(
                null,
                happening.minDegreeYear..happening.maxDegreeYear,
                RegistrationStatus.NOT_IN_RANGE
            )

        when (reg.type) {
            HAPPENING_TYPE.BEDPRES ->
                BedpresRegistration.insert {
                    it[email] = reg.email
                    it[firstName] = reg.firstName
                    it[lastName] = reg.lastName
                    it[degree] = reg.degree.toString()
                    it[degreeYear] = reg.degreeYear
                    it[bedpresSlug] = reg.slug
                    it[terms] = reg.terms
                    it[BedpresRegistration.waitList] = waitList
                }
            HAPPENING_TYPE.EVENT ->
                EventRegistration.insert {
                    it[email] = reg.email
                    it[firstName] = reg.firstName
                    it[lastName] = reg.lastName
                    it[degree] = reg.degree.toString()
                    it[degreeYear] = reg.degreeYear
                    it[eventSlug] = reg.slug
                    it[terms] = reg.terms
                    it[EventRegistration.waitList] = waitList
                }
        }

        if (reg.answers.isNotEmpty()) {
            when (reg.type) {
                HAPPENING_TYPE.BEDPRES ->
                    BedpresAnswer.batchInsert(reg.answers) { a ->
                        this[BedpresAnswer.registrationEmail] = reg.email
                        this[BedpresAnswer.bedpresSlug] = reg.slug
                        this[BedpresAnswer.question] = a.question
                        this[BedpresAnswer.answer] = a.answer
                    }
                HAPPENING_TYPE.EVENT ->
                    EventAnswer.batchInsert(reg.answers) { a ->
                        this[EventAnswer.registrationEmail] = reg.email
                        this[EventAnswer.eventSlug] = reg.slug
                        this[EventAnswer.question] = a.question
                        this[EventAnswer.answer] = a.answer
                    }
            }
        }

        if (waitList)
            return@transaction Triple(waitListSpot.toString(), null, RegistrationStatus.WAIT_LIST)
        else
            return@transaction Triple(null, null, RegistrationStatus.ACCEPTED)
    }
}

fun countRegistrations(slug: String, type: HAPPENING_TYPE): RegistrationCountJson {
    val regCount = transaction {
        addLogger(StdOutSqlLogger)

        when (type) {
            HAPPENING_TYPE.BEDPRES ->
                BedpresRegistration.select {
                    BedpresRegistration.waitList eq false and (BedpresRegistration.bedpresSlug eq slug)
                }.count()
            HAPPENING_TYPE.EVENT ->
                EventRegistration.select {
                    EventRegistration.waitList eq false and (EventRegistration.eventSlug eq slug)
                }.count()
        }
    }

    val waitListCount = transaction {
        addLogger(StdOutSqlLogger)

        when (type) {
            HAPPENING_TYPE.BEDPRES ->
                BedpresRegistration.select {
                    BedpresRegistration.waitList eq true and (BedpresRegistration.bedpresSlug eq slug)
                }.count()
            HAPPENING_TYPE.EVENT ->
                EventRegistration.select {
                    EventRegistration.waitList eq true and (EventRegistration.eventSlug eq slug)
                }.count()
        }
    }

    return RegistrationCountJson(regCount, waitListCount)
}

fun deleteRegistration(shortReg: ShortRegistrationJson) {
    transaction {
        addLogger(StdOutSqlLogger)

        when (shortReg.type) {
            HAPPENING_TYPE.BEDPRES ->
                BedpresRegistration.deleteWhere { BedpresRegistration.bedpresSlug eq shortReg.slug and (BedpresRegistration.email eq shortReg.email) }
            HAPPENING_TYPE.EVENT ->
                BedpresRegistration.deleteWhere { EventRegistration.eventSlug eq shortReg.slug and (EventRegistration.email eq shortReg.email) }
        }
    }
}
