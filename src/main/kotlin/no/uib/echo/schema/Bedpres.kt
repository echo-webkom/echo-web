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
    val slug: Column<String> = varchar("slug", 40).uniqueIndex()
    val spots: Column<Int> = integer("spots")
    val registrationDate: Column<DateTime> = datetime("registrationDate")

    override val primaryKey: PrimaryKey = PrimaryKey(slug)
}

fun insertOrUpdateBedpres(newBedpres: BedpresJson): Pair<HttpStatusCode, String> {
    val bedpresList = transaction {
        addLogger(StdOutSqlLogger)

        Bedpres.select { Bedpres.slug eq newBedpres.slug }.toList()
    }

    if (bedpresList.isEmpty()) {
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

    val bedpres = bedpresList[0]

    if (bedpres[Bedpres.slug] == newBedpres.slug && bedpres[Bedpres.spots] == newBedpres.spots) {
        return Pair(HttpStatusCode.Accepted, "Bedpres with slug = ${newBedpres.slug} has already been submitted.")
    }

    transaction {
        addLogger(StdOutSqlLogger)

        Bedpres.update({ Bedpres.slug eq newBedpres.slug }) {
            it[spots] = newBedpres.spots
        }
    }

    return Pair(
        HttpStatusCode.OK,
        "Updated bedpres with slug = ${newBedpres.slug} to spots = ${newBedpres.spots}."
    )
}

fun deleteBedpresBySlug(slug: BedpresSlugJson) {
    transaction {
        addLogger(StdOutSqlLogger)

        Bedpres.deleteWhere { Bedpres.slug eq slug.slug }
    }
}
