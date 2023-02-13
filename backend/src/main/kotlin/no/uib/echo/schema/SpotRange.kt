package no.uib.echo.schema

import kotlinx.serialization.Serializable
import no.uib.echo.schema.SpotRange.maxDegreeYear
import no.uib.echo.schema.SpotRange.minDegreeYear
import no.uib.echo.schema.SpotRange.spots
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction

@Serializable
data class SpotRangeJson(
    val spots: Int,
    val minDegreeYear: Int,
    val maxDegreeYear: Int
)

@Serializable
data class SpotRangeWithCountJson(
    val spots: Int,
    val minDegreeYear: Int,
    val maxDegreeYear: Int,
    val regCount: Int,
    val waitListCount: Int,
)

object SpotRange : Table() {
    private val id: Column<Int> = integer("id").uniqueIndex().autoIncrement()
    val spots: Column<Int> = integer("spots")
    val minDegreeYear: Column<Int> = integer("min_degree_year")
    val maxDegreeYear: Column<Int> = integer("max_degree_year")
    val happeningSlug: Column<String> = text("happening_slug") references Happening.slug

    override val primaryKey: PrimaryKey = PrimaryKey(id)
}

@Serializable
data class SlugJson(
    val slugs: List<String>
)

@Serializable
data class RegistrationCountJson(
    val slug: String,
    val count: Int,
    val waitListCount: Int,
)

fun selectSpotRanges(slug: String): List<SpotRangeJson> {
    return transaction {
        SpotRange.select {
            SpotRange.happeningSlug eq slug
        }.toList()
    }.map {
        SpotRangeJson(
            it[spots],
            it[minDegreeYear],
            it[maxDegreeYear]
        )
    }
}
