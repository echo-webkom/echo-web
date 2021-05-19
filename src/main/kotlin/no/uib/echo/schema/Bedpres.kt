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

data class BedpresJson(val slug: String, val spots: Int, val registrationDate: String)
data class BedpresSlugJson(val slug: String)

object Bedpres : Table() {
    val slug: Column<String> = varchar("slug", 50).uniqueIndex()
    val spots: Column<Int> = integer("spots")
    val registrationDate: Column<DateTime> = datetime("registrationDate")

    override val primaryKey: PrimaryKey = PrimaryKey(slug)
}

fun selectBedpresBySlug(slug: String): BedpresJson? {
    val bedpres = transaction {
        addLogger(StdOutSqlLogger)

        Bedpres.select { Bedpres.slug eq slug }.firstOrNull()
    }

    return bedpres?.let { BedpresJson(it[Bedpres.slug], it[Bedpres.spots], it[Bedpres.registrationDate].toString()) }
}

fun insertOrUpdateBedpres(newBedpres: BedpresJson): Pair<HttpStatusCode, String> {
    val bedpres = selectBedpresBySlug(newBedpres.slug)

    if (bedpres == null) {
        transaction {
            addLogger(StdOutSqlLogger)

            Bedpres.insert {
                it[slug] = newBedpres.slug
                it[spots] = newBedpres.spots
                it[registrationDate] = DateTime(newBedpres.registrationDate)
            }
        }

        return Pair(HttpStatusCode.OK, "Bedpres submitted.")
    }

    if (bedpres.slug == newBedpres.slug &&
        bedpres.spots == newBedpres.spots &&
        DateTime(bedpres.registrationDate) == DateTime(newBedpres.registrationDate)
    ) {
        return Pair(
            HttpStatusCode.Accepted,
            "Bedpres with slug = ${newBedpres.slug} and registrationDate = ${newBedpres.registrationDate} has already been submitted."
        )
    }

    transaction {
        addLogger(StdOutSqlLogger)

        Bedpres.update({ Bedpres.slug eq newBedpres.slug }) {
            it[spots] = newBedpres.spots
            it[registrationDate] = DateTime(newBedpres.registrationDate)
        }
    }

    return Pair(
        HttpStatusCode.OK,
        "Updated bedpres with slug = ${newBedpres.slug} to spots = ${newBedpres.spots} and registrationDate = ${newBedpres.registrationDate}."
    )
}

fun deleteBedpresBySlug(slug: BedpresSlugJson) {
    transaction {
        addLogger(StdOutSqlLogger)

        Bedpres.deleteWhere { Bedpres.slug eq slug.slug }
    }
}
