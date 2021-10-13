package no.uib.echo.schema

import io.ktor.http.HttpStatusCode
import no.uib.echo.schema.Happening.registrationDate
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.jodatime.datetime
import org.jetbrains.exposed.sql.transactions.transaction
import org.joda.time.DateTime

enum class HAPPENING_TYPE {
    BEDPRES,
    EVENT
}

data class HappeningJson(
    val slug: String,
    val registrationDate: String,
    val spotRanges: List<SpotRangeJson>,
    val type: HAPPENING_TYPE
)

data class HappeningSlugJson(val slug: String, val type: HAPPENING_TYPE)

object Happening : Table() {
    val slug: Column<String> = text("slug").uniqueIndex()
    val happeningType: Column<String> = text("happening_type")
    val registrationDate: Column<DateTime> = datetime("registration_date")

    override val primaryKey: PrimaryKey = PrimaryKey(slug)
}

fun selectHappening(slug: String): HappeningJson? {
    val result = transaction {
        addLogger(StdOutSqlLogger)

        Happening.select { Happening.slug eq slug }.firstOrNull()
    }

    val spotRanges = selectSpotRanges(slug)

    return result?.let {
        HappeningJson(
            it[Happening.slug],
            it[registrationDate].toString(),
            spotRanges,
            HAPPENING_TYPE.valueOf(it[Happening.happeningType])
        )
    }
}

fun insertOrUpdateHappening(newHappening: HappeningJson): Pair<HttpStatusCode, String> {
    val happening = selectHappening(newHappening.slug)

    if (happening == null) {
        transaction {
            addLogger(StdOutSqlLogger)

            Happening.insert {
                it[slug] = newHappening.slug
                it[happeningType] = newHappening.type.toString()
                it[registrationDate] = DateTime(newHappening.registrationDate)
            }
            newHappening.spotRanges.map { range ->
                SpotRange.insert{
                    it[spots] = range.spots
                    it[minDegreeYear] = range.minDegreeYear
                    it[maxDegreeYear] = range.maxDegreeYear
                    it[happeningSlug] = newHappening.slug
                }
            }
        }

        return Pair(HttpStatusCode.OK, "${newHappening.type.toString().lowercase()} submitted with slug = ${newHappening.slug}.")
    }

    if (happening.slug == newHappening.slug &&
        DateTime(happening.registrationDate) == DateTime(newHappening.registrationDate) &&
        happening.spotRanges == newHappening.spotRanges
    ) {
        return Pair(
            HttpStatusCode.Accepted,
            "Happening with slug = ${newHappening.slug}, " +
                    "registrationDate = ${newHappening.registrationDate}, " +
                    "and spotRanges = ${spotRangeToString(newHappening.spotRanges)} has already been submitted."
        )
    }

    transaction {
        addLogger(StdOutSqlLogger)

        Happening.update({ Happening.slug eq newHappening.slug }) {
            it[registrationDate] = DateTime(newHappening.registrationDate)
        }
        newHappening.spotRanges.map { range ->
            SpotRange.update({ SpotRange.happeningSlug eq newHappening.slug }) {
                it[spots] = range.spots
                it[minDegreeYear] = range.minDegreeYear
                it[maxDegreeYear] = range.maxDegreeYear
            }
        }
    }

    return Pair(
        HttpStatusCode.OK,
        "Updated ${newHappening.type} with slug = ${newHappening.slug} " +
                "to registrationDate = ${newHappening.registrationDate} " +
                "and spotRanges = ${spotRangeToString(newHappening.spotRanges)}."
    )
}

fun deleteHappeningBySlug(slug: String): Boolean {
    transaction {
        addLogger(StdOutSqlLogger)

        deleteSpotRanges(slug)
        val happeningExists = Happening.select { Happening.slug eq slug }.firstOrNull() != null
        if (!happeningExists)
            return@transaction false

        Happening.deleteWhere { Happening.slug eq slug }
    }

    return true
}

fun spotRangeToString(spotRanges: List<SpotRangeJson>): String {
    return "[ ${spotRanges.map {
        "(spots = ${it.spots}, minDegreeYear = ${it.minDegreeYear}, maxDegreeYear = ${it.maxDegreeYear}), "
    }} ]"
}
