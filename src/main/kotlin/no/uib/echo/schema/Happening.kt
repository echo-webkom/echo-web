package no.uib.echo.schema

import io.ktor.http.HttpStatusCode
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.jodatime.datetime
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import org.joda.time.DateTime

enum class HAPPENINGTYPE {
    BEDPRES,
    EVENT
}

data class HappeningJson(
    val slug: String,
    val spots: Int,
    val minDegreeYear: Int?,
    val maxDegreeYear: Int?,
    val registrationDate: String,
    val type: HAPPENINGTYPE
)

data class HappeningSlugJson(val slug: String, val type: HAPPENINGTYPE)

object Bedpres : Table() {
    val slug: Column<String> = text("slug").uniqueIndex()
    val spots: Column<Int> = integer("spots")
    val minDegreeYear: Column<Int> = integer("min_degree_year")
    val maxDegreeYear: Column<Int> = integer("max_degree_year")
    val registrationDate: Column<DateTime> = datetime("registration_date")

    override val primaryKey: PrimaryKey = PrimaryKey(slug)
}

object Event : Table() {
    val slug: Column<String> = text("slug").uniqueIndex()
    val spots: Column<Int> = integer("spots")
    val minDegreeYear: Column<Int> = integer("min_degree_year")
    val maxDegreeYear: Column<Int> = integer("max_degree_year")
    val registrationDate: Column<DateTime> = datetime("registration_date")

    override val primaryKey: PrimaryKey = PrimaryKey(slug)
}

fun selectHappeningBySlug(slug: String, type: HAPPENINGTYPE): HappeningJson? {
    val result = transaction {
        addLogger(StdOutSqlLogger)

        when (type) {
            HAPPENINGTYPE.BEDPRES ->
                Bedpres.select { Bedpres.slug eq slug }.firstOrNull()
            HAPPENINGTYPE.EVENT ->
                Event.select { Event.slug eq slug }.firstOrNull()
        }
    }

    return result?.let {
        HappeningJson(
            it[Bedpres.slug],
            it[Bedpres.spots],
            it[Bedpres.minDegreeYear],
            it[Bedpres.maxDegreeYear],
            it[Bedpres.registrationDate].toString(),
            type
        )
    }
}

fun insertOrUpdateBedpres(newHappening: HappeningJson): Pair<HttpStatusCode, String> {
    val happening = selectHappeningBySlug(newHappening.slug, newHappening.type)

    if (happening == null) {
        transaction {
            addLogger(StdOutSqlLogger)

            when (newHappening.type) {
                HAPPENINGTYPE.BEDPRES ->
                    Bedpres.insert {
                        it[slug] = newHappening.slug
                        it[spots] = newHappening.spots
                        it[minDegreeYear] = newHappening.minDegreeYear ?: 1
                        it[maxDegreeYear] = newHappening.maxDegreeYear ?: 5
                        it[registrationDate] = DateTime(newHappening.registrationDate)
                    }
                HAPPENINGTYPE.EVENT ->
                    Event.insert {
                        it[slug] = newHappening.slug
                        it[spots] = newHappening.spots
                        it[minDegreeYear] = newHappening.minDegreeYear ?: 1
                        it[maxDegreeYear] = newHappening.maxDegreeYear ?: 5
                        it[registrationDate] = DateTime(newHappening.registrationDate)
                    }
            }
        }

        return Pair(HttpStatusCode.OK, "Happening submitted (type = ${newHappening.type}).")
    }

    if (happening.slug == newHappening.slug &&
        happening.spots == newHappening.spots &&
        happening.minDegreeYear == newHappening.minDegreeYear &&
        happening.maxDegreeYear == newHappening.maxDegreeYear &&
        DateTime(happening.registrationDate) == DateTime(newHappening.registrationDate) &&
        happening.type == newHappening.type
    ) {
        return Pair(
            HttpStatusCode.Accepted,
            "Happening (${newHappening.type}) with slug = ${newHappening.slug} and registrationDate = ${newHappening.registrationDate} has already been submitted."
        )
    }

    transaction {
        addLogger(StdOutSqlLogger)

        when (newHappening.type) {
            HAPPENINGTYPE.BEDPRES ->
                Bedpres.update({ Bedpres.slug eq newHappening.slug }) {
                    it[spots] = newHappening.spots
                    it[minDegreeYear] = newHappening.minDegreeYear ?: 1
                    it[maxDegreeYear] = newHappening.maxDegreeYear ?: 5
                    it[registrationDate] = DateTime(newHappening.registrationDate)
                }
            HAPPENINGTYPE.EVENT ->
                Event.update({ Event.slug eq newHappening.slug }) {
                    it[spots] = newHappening.spots
                    it[minDegreeYear] = newHappening.minDegreeYear ?: 1
                    it[maxDegreeYear] = newHappening.maxDegreeYear ?: 5
                    it[registrationDate] = DateTime(newHappening.registrationDate)
                }
        }
    }

    return Pair(
        HttpStatusCode.OK,
        "Updated happening (${newHappening.type}) with slug = ${newHappening.slug} to spots = ${newHappening.spots}, minDegreeYear = ${newHappening.minDegreeYear}, maxDegreeYear = ${newHappening.maxDegreeYear} and registrationDate = ${newHappening.registrationDate}."
    )
}

fun deleteHappeningBySlug(happ: HappeningSlugJson) {
    transaction {
        addLogger(StdOutSqlLogger)

        when (happ.type) {
            HAPPENINGTYPE.BEDPRES ->
                Bedpres.deleteWhere { Bedpres.slug eq happ.slug }
            HAPPENINGTYPE.EVENT ->
                Event.deleteWhere { Event.slug eq happ.slug }
        }
    }
}
