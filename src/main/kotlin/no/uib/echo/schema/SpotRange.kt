package no.uib.echo.schema

import no.uib.echo.schema.SpotRange.maxDegreeYear
import no.uib.echo.schema.SpotRange.minDegreeYear
import no.uib.echo.schema.SpotRange.spots
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

data class SpotRangeJson(
    val spots: Int,
    val minDegreeYear: Int,
    val maxDegreeYear: Int
)

data class SpotRangeWithCountJson(
    val spots: Int,
    val minDegreeYear: Int,
    val maxDegreeYear: Int,
    val regCount: Int,
    val waitListCount: Int
)

object SpotRange : Table() {
    val spots: Column<Int> = integer("spots")
    val minDegreeYear: Column<Int> = integer("min_degree_year")
    val maxDegreeYear: Column<Int> = integer("max_degree_year")
    val happeningSlug: Column<String> = text("happening_slug")
    val happeningType: Column<String> = text("happening_type")
}

fun selectSpotRanges(slug: String, type: HAPPENING_TYPE): List<SpotRangeJson> {
    return transaction {
        addLogger(StdOutSqlLogger)

        SpotRange.select {
            SpotRange.happeningSlug eq slug and
                    (SpotRange.happeningType eq type.toString())
        }.toList()
    }.map {
        SpotRangeJson(
            it[spots],
            it[minDegreeYear],
            it[maxDegreeYear]
        )
    }
}

fun whichSpotRange(ranges: List<SpotRangeJson>, degreeYear: Int): SpotRangeJson? {
    for (r in ranges)
        if (degreeYear in r.minDegreeYear..r.maxDegreeYear)
            return r

    return null
}
