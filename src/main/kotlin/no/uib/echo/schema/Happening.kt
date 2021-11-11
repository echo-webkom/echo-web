package no.uib.echo.schema

import com.sendgrid.SendGrid
import io.ktor.http.HttpStatusCode
import no.uib.echo.plugins.Routing.registrationRoute
import no.uib.echo.schema.Happening.organizerEmail
import no.uib.echo.schema.Happening.registrationDate
import no.uib.echo.sendEmail
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.jodatime.datetime
import org.jetbrains.exposed.sql.transactions.transaction
import org.joda.time.DateTime

private const val REG_LINK_LENGTH = 128

enum class HAPPENING_TYPE {
    BEDPRES,
    EVENT
}

data class HappeningJson(
    val slug: String,
    val registrationDate: String,
    val spotRanges: List<SpotRangeJson>,
    val type: HAPPENING_TYPE,
    val organizerEmail: String
)

data class HappeningSlugJson(val slug: String, val type: HAPPENING_TYPE)

data class HappeningResponseJson(val registrationsLink: String, val message: String)

object Happening : Table() {
    val slug: Column<String> = text("slug").uniqueIndex()
    val happeningType: Column<String> = text("happening_type")
    val registrationDate: Column<DateTime> = datetime("registration_date")
    val organizerEmail: Column<String?> = text("organizer_email").nullable()
    val registrationsLink: Column<String> = text("registrations_link")

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
            HAPPENING_TYPE.valueOf(it[Happening.happeningType]),
            it[organizerEmail] ?: ""
        )
    }
}

fun insertOrUpdateHappening(
    newHappening: HappeningJson,
    sendGrid: SendGrid?,
    sendEmail: Boolean
): Pair<HttpStatusCode, HappeningResponseJson> {
    val happening = selectHappening(newHappening.slug)
    val registrationsLink =
        (1..REG_LINK_LENGTH).map {
            (('A'..'Z') + ('a'..'z') + ('0'..'9'))
                .random()
        }.joinToString("")

    if (happening == null) {
        transaction {
            addLogger(StdOutSqlLogger)

            Happening.insert {
                it[slug] = newHappening.slug
                it[happeningType] = newHappening.type.toString()
                it[registrationDate] = DateTime(newHappening.registrationDate)
                it[organizerEmail] = newHappening.organizerEmail
                it[Happening.registrationsLink] = registrationsLink
            }
            newHappening.spotRanges.map { range ->
                SpotRange.insert {
                    it[spots] = range.spots
                    it[minDegreeYear] = range.minDegreeYear
                    it[maxDegreeYear] = range.maxDegreeYear
                    it[happeningSlug] = newHappening.slug
                }
            }
        }

        if (sendEmail)
            sendRegistrationsLink(sendGrid, newHappening, registrationsLink)

        return Pair(
            HttpStatusCode.OK,
            HappeningResponseJson(
                registrationsLink,
                "${newHappening.type.toString().lowercase()} submitted with slug = ${newHappening.slug}."
            )
        )
    }

    if (happening.slug == newHappening.slug &&
        DateTime(happening.registrationDate) == DateTime(newHappening.registrationDate) &&
        happening.spotRanges == newHappening.spotRanges &&
        happening.organizerEmail == newHappening.organizerEmail
    ) {
        return Pair(
            HttpStatusCode.Accepted,
            HappeningResponseJson(
                registrationsLink,
                "Happening with slug = ${newHappening.slug}, " +
                        "registrationDate = ${newHappening.registrationDate}, " +
                        "spotRanges = ${spotRangeToString(newHappening.spotRanges)}, " +
                        "and organizerEmail = ${newHappening.organizerEmail} has already been submitted."
            )
        )
    }

    transaction {
        addLogger(StdOutSqlLogger)

        Happening.update({ Happening.slug eq newHappening.slug }) {
            it[registrationDate] = DateTime(newHappening.registrationDate)
            it[organizerEmail] = newHappening.organizerEmail
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
        HappeningResponseJson(
            registrationsLink,
            "Updated ${newHappening.type} with slug = ${newHappening.slug} " +
                    "to registrationDate = ${newHappening.registrationDate}, " +
                    "spotRanges = ${spotRangeToString(newHappening.spotRanges)}, " +
                    "and organizerEmail = ${organizerEmail}."
        )
    )
}

fun deleteHappeningBySlug(slug: String): Boolean {
    return transaction {
        addLogger(StdOutSqlLogger)

        val happeningExists = Happening.select { Happening.slug eq slug }.firstOrNull() != null
        if (!happeningExists)
            return@transaction false

        SpotRange.deleteWhere {
            SpotRange.happeningSlug eq slug
        }

        Answer.deleteWhere {
            Answer.happeningSlug eq slug
        }

        Registration.deleteWhere {
            Registration.happeningSlug eq slug
        }

        Happening.deleteWhere {
            Happening.slug eq slug
        }

        return@transaction true
    }
}

fun sendRegistrationsLink(sendGrid: SendGrid?, newHappening: HappeningJson, registrationsLink: String) {
    if (sendGrid != null) {
        if (!sendEmail(
                "webkom@echo.uib.no",
                newHappening.organizerEmail,
                "Påmeldingsliste til '${newHappening.slug}'",
                "Her er de påmeldte til arrangementet '${newHappening.slug}'.\n" +
                        "Siden vil oppdateres automatisk når flere melder seg på.\n" +
                        "Du trenger bare å refreshe siden for å få inn de nyeste påmeldingene." +
                        "\n\n\nhttps://echo-web-backend-prod.herokuapp.com/$registrationRoute/$registrationsLink",
                sendGrid
            )
        ) {
            System.err.println("ERROR: could not send registrations link email.")
        }
    }
}

fun spotRangeToString(spotRanges: List<SpotRangeJson>): String {
    return "[ ${
        spotRanges.map {
            "(spots = ${it.spots}, minDegreeYear = ${it.minDegreeYear}, maxDegreeYear = ${it.maxDegreeYear}), "
        }
    } ]"
}
