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
    val slug: Column<String> = text("slug")
    val happeningType: Column<String> = text("happening_type")
    val registrationDate: Column<DateTime> = datetime("registration_date")

    override val primaryKey: PrimaryKey = PrimaryKey(slug, happeningType)
}

fun selectHappening(slug: String, type: HAPPENING_TYPE): HappeningJson? {
    val result = transaction {
        addLogger(StdOutSqlLogger)

        Happening.select { Happening.slug eq slug and (Happening.happeningType eq type.toString() ) }.firstOrNull()
    }

    val spotRanges = selectSpotRanges(slug, type)

    return result?.let {
        HappeningJson(
            it[Happening.slug],
            it[registrationDate].toString(),
            spotRanges,
            type
        )
    }
}

fun insertOrUpdateHappening(newHappening: HappeningJson): Pair<HttpStatusCode, String> {
    val happening = selectHappening(newHappening.slug, newHappening.type)

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
                    it[happeningType] = newHappening.type.toString()
                }
            }
        }

        return Pair(HttpStatusCode.OK, "Happening submitted (type = ${newHappening.type}).")
    }

    if (happening.slug == newHappening.slug &&
        DateTime(happening.registrationDate) == DateTime(newHappening.registrationDate) &&
        happening.type == newHappening.type &&
        happening.spotRanges == newHappening.spotRanges
    ) {
        return Pair(
            HttpStatusCode.Accepted,
            "Happening (${newHappening.type}) with slug = ${newHappening.slug}, " +
                    "registrationDate = ${newHappening.registrationDate}, " +
                    "and spotRanges = ${spotRangeToString(newHappening.spotRanges)} has already been submitted."
        )
    }

    transaction {
        addLogger(StdOutSqlLogger)

        Happening.update({ Happening.slug eq newHappening.slug and (Happening.happeningType eq newHappening.type.toString())}) {
            it[registrationDate] = DateTime(newHappening.registrationDate)
        }
        newHappening.spotRanges.map { range ->
            SpotRange.update({ SpotRange.happeningSlug eq newHappening.slug and (SpotRange.happeningSlug eq newHappening.type.toString() )}) {
                it[spots] = range.spots
                it[minDegreeYear] = range.spots
                it[maxDegreeYear] = range.spots
            }
        }
    }

    return Pair(
        HttpStatusCode.OK,
        "Updated happening (${newHappening.type}) with slug = ${newHappening.slug} " +
                "to registrationDate = ${newHappening.registrationDate} " +
                "and spotRanges = ${spotRangeToString(newHappening.spotRanges)}."
    )
}

fun deleteHappeningBySlug(happ: HappeningSlugJson) {
    transaction {
        addLogger(StdOutSqlLogger)

        Happening.deleteWhere { Happening.slug eq happ.slug and (Happening.happeningType eq happ.type.toString()) }
    }
}

fun spotRangeToString(spotRanges: List<SpotRangeJson>): String {
    return "[ ${spotRanges.map {
        "(spots = ${it.spots}, minDegreeYear = ${it.minDegreeYear}, maxDegreeYear = ${it.maxDegreeYear}), "
    }} ]"
}
