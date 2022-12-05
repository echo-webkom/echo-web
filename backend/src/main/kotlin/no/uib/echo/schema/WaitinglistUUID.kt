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
    val stringId: String,
    val userEmail: String,
    val happeningSlug: String,
    val lastNotified: String,

)

object WaitingListUUID : Table("waiting_list_uuid") {
    val uuid: Column<String> = text("uuid").uniqueIndex()
    val userEmail: Column<String> = text("user_email") references User.email
    val happeningSlug: Column<String> = text("happening_slug") references Happening.slug
    val lastNotified: Column<DateTime> = datetime("last_Notified").default(DateTime(0)) // default value is January 1st, 1970 (1970-01-01T01:00:00.000+01:00)

    init {
        uniqueIndex(userEmail, happeningSlug)
    }
    override val primaryKey: PrimaryKey = PrimaryKey(uuid)
}

suspend fun notifyWaitingList(slug: String, SendGridApiKey: String) {
    if (!isPromotionLegal(slug)) {
        return
    }
    val peopleToNotify = getPeopleToNotify(slug)

    for (person in peopleToNotify) {
        val registrationPerson = transaction {
            Registration.select {
                Registration.waitList eq true and
                    (Registration.userEmail eq person.userEmail)
            }.firstOrNull()
        }?.let {
            val user = transaction {
                User.select {
                    User.email eq person.userEmail
                }.firstOrNull()
            }
            EmailRegistrationJson(
                it[Registration.userEmail],
                user?.get(User.alternateEmail),
                it[Registration.happeningSlug],
            )
        } ?: return

        if (!isPersonLegalToNotify(slug, registrationPerson.email)) {
            // todo, find a way to do this at the start of the for loop.
            return
        }

        transaction {
            WaitingListUUID.update({
                WaitingListUUID.happeningSlug eq slug and
                    (WaitingListUUID.userEmail eq registrationPerson.email)
            }) {
                it[lastNotified] = DateTime.now()
            }
        }

        sendWaitingListEmail(
            SendGridApiKey,
            registrationPerson,
            person.stringId
        )
    }
}

fun getPeopleToNotify(slug: String): List<WaitinglistUUIDJson> {
    val peopleToNotify = transaction {
        WaitingListUUID.select {
            WaitingListUUID.happeningSlug eq slug
        }.toList().map { reg ->
            WaitinglistUUIDJson(
                reg[WaitingListUUID.uuid],
                reg[WaitingListUUID.userEmail],
                reg[WaitingListUUID.happeningSlug],
                reg[WaitingListUUID.lastNotified].toString()
            )
        }
    }
    return peopleToNotify
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
            HAPPENING_TYPE.BEDPRES, // TODO get this from the event, dont hard code it
            it[Happening.studentGroupName] ?: "",
            it[Happening.studentGroupRegistrationDate].toString(),
            emptyList(),
            it[Happening.onlyForStudentGroups],

        )
    } ?: return false

    if (DateTime(happening.happeningDate).isAfterNow) {
        return false
    }

    val spots = happening.spotRanges.fold(0) { total, spotRange -> total + spotRange.spots }
    val count = countRegistrationsDegreeYear(slug, 1..5, false)

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

    // TODO: denne skal brukes til å sjekke trinn og prikker, hvis vi trenger det.
    return true
}

fun isPersonLegalToPromote(slug: String, userEmail: String): Boolean {
    // TODO: denne skal brukes til å sjekke trinn og prikker, hvis vi trenger det.
    return true
}
