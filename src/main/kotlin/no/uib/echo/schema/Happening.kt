package no.uib.echo.schema

import io.ktor.http.HttpStatusCode
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import no.uib.echo.SendGridTemplate
import no.uib.echo.Template
import no.uib.echo.plugins.Routing.registrationRoute
import no.uib.echo.schema.Happening.happeningDate
import no.uib.echo.schema.Happening.organizerEmail
import no.uib.echo.schema.Happening.registrationDate
import no.uib.echo.sendEmail
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.StdOutSqlLogger
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.addLogger
import org.jetbrains.exposed.sql.batchInsert
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.jodatime.datetime
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import org.joda.time.DateTime
import java.io.IOException

private const val REG_LINK_LENGTH = 128

enum class HAPPENING_TYPE {
    BEDPRES,
    EVENT
}

data class HappeningJson(
    val slug: String,
    val title: String,
    val registrationDate: String,
    val happeningDate: String,
    val spotRanges: List<SpotRangeJson>,
    val type: HAPPENING_TYPE,
    val organizerEmail: String
)

data class HappeningSlugJson(val slug: String, val type: HAPPENING_TYPE)

data class HappeningResponseJson(val registrationsLink: String?, val message: String)

object Happening : Table() {
    val slug: Column<String> = text("slug").uniqueIndex()
    val title: Column<String> = text("title")
    val happeningType: Column<String> = text("happening_type")
    val registrationDate: Column<DateTime> = datetime("registration_date")
    val happeningDate: Column<DateTime> = datetime("happening_date")
    val organizerEmail: Column<String> = text("organizer_email")
    val registrationsLink: Column<String?> = text("registrations_link").nullable()

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
            it[Happening.title],
            it[registrationDate].toString(),
            it[happeningDate].toString(),
            spotRanges,
            HAPPENING_TYPE.valueOf(it[Happening.happeningType]),
            it[organizerEmail]
        )
    }
}

suspend fun insertOrUpdateHappening(
    newHappening: HappeningJson,
    sendGridApiKey: String?,
    sendEmail: Boolean,
    dev: Boolean,
): Pair<HttpStatusCode, HappeningResponseJson> {
    if (newHappening.spotRanges.isEmpty()) {
        return Pair(
            HttpStatusCode.BadRequest,
            HappeningResponseJson(null, "No spot range given for happening with slug ${newHappening.slug}.")
        )
    }

    val happening = selectHappening(newHappening.slug)

    val registrationsLink =
        if (dev)
            newHappening.slug
        else
            (1..REG_LINK_LENGTH).map {
                (('A'..'Z') + ('a'..'z') + ('0'..'9'))
                    .random()
            }.joinToString("")

    if (happening == null) {
        transaction {
            addLogger(StdOutSqlLogger)

            Happening.insert {
                it[slug] = newHappening.slug
                it[title] = newHappening.title
                it[happeningType] = newHappening.type.toString()
                it[registrationDate] = DateTime(newHappening.registrationDate)
                it[happeningDate] = DateTime(newHappening.happeningDate)
                it[organizerEmail] = newHappening.organizerEmail.lowercase()
                it[Happening.registrationsLink] = registrationsLink
            }
            SpotRange.batchInsert(newHappening.spotRanges) { sr ->
                this[SpotRange.spots] = sr.spots
                this[SpotRange.minDegreeYear] = sr.minDegreeYear
                this[SpotRange.maxDegreeYear] = sr.maxDegreeYear
                this[SpotRange.happeningSlug] = newHappening.slug
            }
        }

        if (sendEmail) {
            val hapTypeLiteral = when (newHappening.type) {
                HAPPENING_TYPE.EVENT ->
                    "arrangementet"
                HAPPENING_TYPE.BEDPRES ->
                    "bedriftspresentasjonen"
            }

            if (sendGridApiKey != null) {
                try {
                    withContext(Dispatchers.IO) {
                        sendEmail(
                            "webkom@echo.uib.no",
                            newHappening.organizerEmail,
                            SendGridTemplate(
                                newHappening.title,
                                "https://echo.uib.no/$registrationRoute/$registrationsLink",
                                hapTypeLiteral
                            ),
                            Template.REGS_LINK,
                            sendGridApiKey
                        )
                    }
                } catch (e: IOException) {
                    e.printStackTrace()
                }
            }
        }

        return Pair(
            HttpStatusCode.OK,
            HappeningResponseJson(
                registrationsLink,
                "${newHappening.type.toString().lowercase()} submitted with slug = ${newHappening.slug}."
            )
        )
    }

    if (happening.slug == newHappening.slug &&
        happening.title == newHappening.title &&
        DateTime(happening.registrationDate) == DateTime(newHappening.registrationDate) &&
        DateTime(happening.happeningDate) == DateTime(newHappening.happeningDate) &&
        happening.spotRanges == newHappening.spotRanges &&
        happening.organizerEmail.lowercase() == newHappening.organizerEmail.lowercase()
    ) {
        return Pair(
            HttpStatusCode.Accepted,
            HappeningResponseJson(
                registrationsLink,
                "Happening with slug = ${newHappening.slug}, " +
                    "title = ${newHappening.title}, " +
                    "registrationDate = ${newHappening.registrationDate}, " +
                    "happeningDate = ${newHappening.happeningDate}, " +
                    "spotRanges = ${spotRangeToString(newHappening.spotRanges)}, " +
                    "and organizerEmail = ${newHappening.organizerEmail.lowercase()} has already been submitted."
            )
        )
    }

    transaction {
        addLogger(StdOutSqlLogger)

        Happening.update({ Happening.slug eq newHappening.slug }) {
            it[title] = newHappening.title
            it[registrationDate] = DateTime(newHappening.registrationDate)
            it[happeningDate] = DateTime(newHappening.happeningDate)
            it[organizerEmail] = newHappening.organizerEmail.lowercase()
        }

        SpotRange.deleteWhere {
            SpotRange.happeningSlug eq newHappening.slug
        }

        SpotRange.batchInsert(newHappening.spotRanges) { sr ->
            this[SpotRange.spots] = sr.spots
            this[SpotRange.minDegreeYear] = sr.minDegreeYear
            this[SpotRange.maxDegreeYear] = sr.maxDegreeYear
            this[SpotRange.happeningSlug] = newHappening.slug
        }
    }

    return Pair(
        HttpStatusCode.OK,
        HappeningResponseJson(
            registrationsLink,
            "Updated ${newHappening.type} with slug = ${newHappening.slug} " +
                "to title = ${newHappening.title}, " +
                "registrationDate = ${newHappening.registrationDate}, " +
                "happeningDate = ${newHappening.happeningDate}, " +
                "spotRanges = ${spotRangeToString(newHappening.spotRanges)}, " +
                "and organizerEmail = ${newHappening.organizerEmail.lowercase()}."
        )
    )
}

fun spotRangeToString(spotRanges: List<SpotRangeJson>): String {
    return "[ ${
    spotRanges.map {
        "(spots = ${it.spots}, minDegreeYear = ${it.minDegreeYear}, maxDegreeYear = ${it.maxDegreeYear}), "
    }
    } ]"
}

fun validateLink(link: String?, dev: Boolean): ResultRow? {
    if (link == null || (link.length != 128 && !dev))
        return null

    return transaction {
        addLogger(StdOutSqlLogger)

        Happening.select {
            Happening.registrationsLink eq link
        }.firstOrNull()
    }
}
