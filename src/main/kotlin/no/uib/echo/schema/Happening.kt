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

enum class HAPPENING_TYPE {
    BEDPRES,
    EVENT
}

data class HappeningJson(
    val slug: String,
    val spots: Int,
    val minDegreeYear: Int?,
    val maxDegreeYear: Int?,
    val registrationDate: String,
    val type: HAPPENING_TYPE
)

data class HappeningSlugJson(val slug: String, val type: HAPPENING_TYPE)

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

fun selectHappeningBySlug(slug: String, type: HAPPENING_TYPE): HappeningJson? {
    val result = transaction {
        addLogger(StdOutSqlLogger)

        when (type) {
            HAPPENING_TYPE.BEDPRES ->
                Bedpres.select { Bedpres.slug eq slug }.firstOrNull()
            HAPPENING_TYPE.EVENT ->
                Event.select { Event.slug eq slug }.firstOrNull()
        }
    }

    return result?.let {
        when (type) {
            HAPPENING_TYPE.BEDPRES ->
                HappeningJson(
                    it[Bedpres.slug],
                    it[Bedpres.spots],
                    it[Bedpres.minDegreeYear],
                    it[Bedpres.maxDegreeYear],
                    it[Bedpres.registrationDate].toString(),
                    type
                )
            HAPPENING_TYPE.EVENT ->
                HappeningJson(
                    it[Event.slug],
                    it[Event.spots],
                    it[Event.minDegreeYear],
                    it[Event.maxDegreeYear],
                    it[Event.registrationDate].toString(),
                    type
                )
        }
    }
}

fun insertOrUpdateHappening(newHappening: HappeningJson): Pair<HttpStatusCode, String> {
    val happening = selectHappeningBySlug(newHappening.slug, newHappening.type)

    if (happening == null) {
        transaction {
            addLogger(StdOutSqlLogger)

            when (newHappening.type) {
                HAPPENING_TYPE.BEDPRES ->
                    Bedpres.insert {
                        it[slug] = newHappening.slug
                        it[spots] = newHappening.spots
                        it[minDegreeYear] = newHappening.minDegreeYear ?: 1
                        it[maxDegreeYear] = newHappening.maxDegreeYear ?: 5
                        it[registrationDate] = DateTime(newHappening.registrationDate)
                    }
                HAPPENING_TYPE.EVENT ->
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
            HAPPENING_TYPE.BEDPRES ->
                Bedpres.update({ Bedpres.slug eq newHappening.slug }) {
                    it[spots] = newHappening.spots
                    it[minDegreeYear] = newHappening.minDegreeYear ?: 1
                    it[maxDegreeYear] = newHappening.maxDegreeYear ?: 5
                    it[registrationDate] = DateTime(newHappening.registrationDate)
                }
            HAPPENING_TYPE.EVENT ->
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
            HAPPENING_TYPE.BEDPRES ->
                Bedpres.deleteWhere { Bedpres.slug eq happ.slug }
            HAPPENING_TYPE.EVENT ->
                Event.deleteWhere { Event.slug eq happ.slug }
        }
    }
}
