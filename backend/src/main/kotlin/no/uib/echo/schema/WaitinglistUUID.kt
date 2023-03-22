package no.uib.echo.schema

import kotlinx.serialization.Serializable
import no.uib.echo.sendWaitingListEmail
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.jodatime.datetime
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import org.joda.time.DateTime

@Serializable
data class WaitinglistUUIDJson(
    val uuid: String,
    val userEmail: String,
    val happeningSlug: String,
    val lastNotified: String
)

object WaitingListUUID : Table("waiting_list_uuid") {
    val uuid: Column<String> = text("uuid").uniqueIndex()
    val userEmail: Column<String> = text("user_email") references User.email
    val happeningSlug: Column<String> = text("happening_slug") references Happening.slug
    val lastNotified: Column<DateTime> = datetime("last_notified").default(DateTime(0)) // default value is January 1st, 1970 (1970-01-01T01:00:00.000+01:00)

    init {
        uniqueIndex(userEmail, happeningSlug)
    }
    override val primaryKey: PrimaryKey = PrimaryKey(uuid)
}

suspend fun notifyWaitinglistPerson(slug: String, email: String, sendGridApiKey: String): Boolean {
    if (!isPromotionLegal(slug)) {
        return false
    }
    val person = getPersonToNotify(slug, email) ?: return false

    val user = transaction {
        User.select {
            User.email eq person.userEmail
        }.firstOrNull()
    } ?: return false

    if (!isPersonLegalToNotify(slug, user[User.email])) {
        return false
    }

    val emailSent = sendWaitingListEmail(
        sendGridApiKey = sendGridApiKey,
        email = user[User.alternateEmail] ?: user[User.email],
        slug = slug,
        uuid = person.uuid
    )

    if (!emailSent) {
        return false
    }

    transaction {
        WaitingListUUID.update({
            WaitingListUUID.happeningSlug eq slug and
                (WaitingListUUID.userEmail eq user[User.email])
        }) {
            it[lastNotified] = DateTime.now()
        }
    }

    return true
}

fun getPersonToNotify(slug: String, email: String): WaitinglistUUIDJson? {
    val person = transaction {
        WaitingListUUID.select {
            WaitingListUUID.happeningSlug eq slug and
                (WaitingListUUID.userEmail eq email)
        }.firstOrNull()
    }
    if (person != null) {
        return WaitinglistUUIDJson(
            person[WaitingListUUID.uuid],
            person[WaitingListUUID.userEmail],
            person[WaitingListUUID.happeningSlug],
            person[WaitingListUUID.lastNotified].toString()
        )
    }
    return null
}

fun isPromotionLegal(slug: String): Boolean {
    val happening = transaction {
        Happening.select {
            Happening.slug eq slug
        }.firstOrNull()
    }?.let {
        HappeningJson(
            it[Happening.slug],
            it[Happening.title],
            it[Happening.registrationDate].toString(),
            it[Happening.happeningDate].toString(),
            selectSpotRanges(slug),
            HAPPENING_TYPE.BEDPRES,
            it[Happening.studentGroupName] ?: "",
            it[Happening.studentGroupRegistrationDate].toString(),
            emptyList(),
            it[Happening.onlyForStudentGroups]

        )
    } ?: return false

    if (DateTime(happening.happeningDate).isBeforeNow) {
        return false
    }

    val spots = happening.spotRanges.fold(0) { total, spotRange -> total + spotRange.spots }
    val count = countRegistrationsDegreeYear(slug, 1..5, Status.REGISTERED)

    if (count >= spots) {
        return false
    }

    return true
}

fun isPersonLegalToNotify(slug: String, userEmail: String): Boolean {
    val minutesBetweenNotifications = 30
    val lastNotified = transaction {
        WaitingListUUID.select {
            WaitingListUUID.happeningSlug eq slug
            WaitingListUUID.userEmail eq userEmail
        }.firstOrNull()
    }?.let { res -> res[WaitingListUUID.lastNotified] }

    if (lastNotified != null && lastNotified.plusMinutes(minutesBetweenNotifications).isAfterNow) {
        return false
    }

    // denne kan brukes til å sjekke trinn og prikker, hvis vi trenger det.
    return true
}

fun isPersonLegalToPromote(slug: String, userEmail: String): Boolean {
    // denne kan brukes til å sjekke trinn og prikker, hvis vi trenger det.
    return true
}
