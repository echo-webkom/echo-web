package no.uib.echo.schema

import io.ktor.http.HttpStatusCode
import kotlinx.serialization.Serializable
import no.uib.echo.sendRegsLinkEmail
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

private const val REG_LINK_LENGTH = 128
private const val REG_VERIFY_TOKEN_LENGTH = 16

enum class HAPPENING_TYPE {
    BEDPRES,
    EVENT
}

@Serializable
data class HappeningJson(
    val title: String,
    val registrationDate: String,
    val happeningDate: String,
    val spotRanges: List<SpotRangeJson>,
    val type: HAPPENING_TYPE,
    val organizerEmail: String
)

// Use for testing ONLY
data class HappeningWithSlugJson(
    val slug: String,
    val title: String,
    val registrationDate: String,
    val happeningDate: String,
    val spotRanges: List<SpotRangeJson>,
    val type: HAPPENING_TYPE,
    val organizerEmail: String
)

@Serializable
data class HappeningInfoJson(
    val spotRanges: List<SpotRangeWithCountJson>,
    val regVerifyToken: String? = null
)

object Happening : Table() {
    val slug: Column<String> = text("slug").uniqueIndex()
    val title: Column<String> = text("title")
    val happeningType: Column<String> = text("happening_type")
    val registrationDate: Column<DateTime> = datetime("registration_date")
    val happeningDate: Column<DateTime> = datetime("happening_date")
    val organizerEmail: Column<String> = text("organizer_email")
    val registrationsLink: Column<String?> = text("registrations_link").nullable()
    val regVerifyToken: Column<String?> = text("reg_verify_token").nullable()

    override val primaryKey: PrimaryKey = PrimaryKey(slug)
}

suspend fun insertOrUpdateHappening(
    newHappening: HappeningJson,
    slug: String,
    sendGridApiKey: String?,
    sendEmail: Boolean,
    dev: Boolean,
): Pair<HttpStatusCode, String> {
    if (newHappening.spotRanges.isEmpty()) {
        return Pair(
            HttpStatusCode.BadRequest,
            "No spot range given for happening with slug = $slug."
        )
    }

    val registrationsLink =
        if (dev)
            slug
        else
            randomString(REG_LINK_LENGTH)

    val regVerifyToken =
        if (dev)
            slug
        else
            randomString(REG_VERIFY_TOKEN_LENGTH)

    val happening = transaction {
        addLogger(StdOutSqlLogger)

        Happening.select {
            Happening.slug eq slug
        }.firstOrNull()
    }

    if (happening == null) {
        transaction {
            addLogger(StdOutSqlLogger)

            Happening.insert {
                it[Happening.slug] = slug
                it[title] = newHappening.title
                it[happeningType] = newHappening.type.toString()
                it[registrationDate] = DateTime(newHappening.registrationDate)
                it[happeningDate] = DateTime(newHappening.happeningDate)
                it[organizerEmail] = newHappening.organizerEmail.lowercase()
                it[Happening.registrationsLink] = registrationsLink
                it[Happening.regVerifyToken] = regVerifyToken
            }
            SpotRange.batchInsert(newHappening.spotRanges) { sr ->
                this[SpotRange.spots] = sr.spots
                this[SpotRange.minDegreeYear] = sr.minDegreeYear
                this[SpotRange.maxDegreeYear] = sr.maxDegreeYear
                this[SpotRange.happeningSlug] = slug
            }
        }

        if (sendEmail && sendGridApiKey != null) {
            sendRegsLinkEmail(sendGridApiKey, newHappening, registrationsLink)
        }

        return Pair(
            HttpStatusCode.OK,
            "${newHappening.type.toString().lowercase()} submitted with slug = $slug."
        )
    }

    val spotRanges = selectSpotRanges(slug)

    if (happening[Happening.slug] == slug &&
        happening[Happening.title] == newHappening.title &&
        DateTime(happening[Happening.registrationDate]) == DateTime(newHappening.registrationDate) &&
        DateTime(happening[Happening.happeningDate]) == DateTime(newHappening.happeningDate) &&
        spotRanges == newHappening.spotRanges &&
        happening[Happening.organizerEmail].lowercase() == newHappening.organizerEmail.lowercase()
    ) {
        return Pair(
            HttpStatusCode.Accepted,
            "Happening with slug = $slug, " +
                "title = ${newHappening.title}, " +
                "registrationDate = ${newHappening.registrationDate}, " +
                "happeningDate = ${newHappening.happeningDate}, " +
                "spotRanges = ${spotRangeToString(newHappening.spotRanges)}, " +
                "and organizerEmail = ${newHappening.organizerEmail.lowercase()} has already been submitted."
        )
    }

    transaction {
        addLogger(StdOutSqlLogger)

        Happening.update({ Happening.slug eq slug }) {
            it[title] = newHappening.title
            it[registrationDate] = DateTime(newHappening.registrationDate)
            it[happeningDate] = DateTime(newHappening.happeningDate)
            it[organizerEmail] = newHappening.organizerEmail.lowercase()
        }

        SpotRange.deleteWhere {
            SpotRange.happeningSlug eq slug
        }

        SpotRange.batchInsert(newHappening.spotRanges) { sr ->
            this[SpotRange.spots] = sr.spots
            this[SpotRange.minDegreeYear] = sr.minDegreeYear
            this[SpotRange.maxDegreeYear] = sr.maxDegreeYear
            this[SpotRange.happeningSlug] = slug
        }
    }

    val message =
        "Updated ${newHappening.type} with slug = $slug " +
            "to title = ${newHappening.title}, " +
            "registrationDate = ${newHappening.registrationDate}, " +
            "happeningDate = ${newHappening.happeningDate}, " +
            "spotRanges = ${spotRangeToString(newHappening.spotRanges)}, " +
            "and organizerEmail = ${newHappening.organizerEmail.lowercase()}."

    if (happening[Happening.organizerEmail].lowercase() != newHappening.organizerEmail.lowercase() && sendEmail && sendGridApiKey != null) {
        sendRegsLinkEmail(sendGridApiKey, newHappening, registrationsLink)
        return Pair(
            HttpStatusCode.OK,
            message + "Sent mail to new address: ${newHappening.organizerEmail.lowercase()}."
        )
    }

    return Pair(
        HttpStatusCode.OK,
        message
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

        val hap = Happening.select {
            Happening.registrationsLink eq link
        }.firstOrNull() ?: return@transaction null

        return@transaction hap
    }
}

fun randomString(length: Int): String {
    return (1..length).map {
        (('A'..'Z') + ('a'..'z') + ('0'..'9'))
            .random()
    }.joinToString("")
}

fun removeSlug(withSlug: HappeningWithSlugJson): HappeningJson {
    return withSlug.let {
        HappeningJson(
            it.title,
            it.registrationDate,
            it.happeningDate,
            it.spotRanges,
            it.type,
            it.organizerEmail
        )
    }
}

fun HAPPENING_TYPE.eventOrBedpresStr(eventStr: String, bedpresStr: String): String {
    return when (this) {
        HAPPENING_TYPE.EVENT -> eventStr
        HAPPENING_TYPE.BEDPRES -> bedpresStr
    }
}
