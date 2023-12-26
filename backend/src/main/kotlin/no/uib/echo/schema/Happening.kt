package no.uib.echo.schema

import io.ktor.http.HttpStatusCode
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.batchInsert
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.jodatime.datetime
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import org.joda.time.DateTime

@Suppress("ktlint:standard:class-naming")
enum class HAPPENING_TYPE {
    BEDPRES,
    EVENT,
}

@Serializable
data class HappeningJson(
    val slug: String,
    val title: String,
    val registrationDate: String,
    val happeningDate: String,
    val spotRanges: List<SpotRangeJson>,
    val type: HAPPENING_TYPE,
    val studentGroupName: String,
    val studentGroupRegistrationDate: String? = null,
    val studentGroups: List<String> = emptyList(),
    val onlyForStudentGroups: Boolean? = null,
)

@Serializable
data class HappeningInfoJson(
    val spotRanges: List<SpotRangeWithCountJson>,
)

object Happening : Table() {
    val slug: Column<String> = text("slug").uniqueIndex()
    val title: Column<String> = text("title")
    val happeningType: Column<String> = text("happening_type")
    val registrationDate: Column<DateTime> = datetime("registration_date")
    val happeningDate: Column<DateTime> = datetime("happening_date")
    val studentGroupName: Column<String?> = text("student_group_name").references(StudentGroup.name).nullable()
    val studentGroupRegistrationDate: Column<DateTime?> = datetime("student_group_registration_date").nullable()
    val onlyForStudentGroups: Column<Boolean> = bool("only_for_student_groups").default(false)

    override val primaryKey: PrimaryKey = PrimaryKey(slug)
}

object StudentGroupHappeningRegistration : Table("student_group_happening_registration") {
    val studentGroupName: Column<String> = text("student_group_name").references(StudentGroup.name)
    val happeningSlug: Column<String> = text("happening_slug").references(Happening.slug)

    override val primaryKey: PrimaryKey =
        PrimaryKey(
            StudentGroupHappeningRegistration.studentGroupName,
            StudentGroupHappeningRegistration.happeningSlug,
        )
}

fun insertOrUpdateHappening(newHappening: HappeningJson): Pair<HttpStatusCode, String> {
    if (newHappening.spotRanges.isEmpty()) {
        return Pair(
            HttpStatusCode.BadRequest,
            "No spot range given for happening with slug ${newHappening.slug}.",
        )
    }

    val happening =
        transaction {
            Happening.select {
                Happening.slug eq newHappening.slug
            }.firstOrNull()
        }

    val spotRanges = selectSpotRanges(newHappening.slug)
    val studentGroups =
        transaction {
            StudentGroupHappeningRegistration.select {
                StudentGroupHappeningRegistration.happeningSlug eq newHappening.slug
            }.toList().map { it[StudentGroupHappeningRegistration.studentGroupName] }
        }

    if (happening == null) {
        transaction {
            Happening.insert {
                it[slug] = newHappening.slug
                it[title] = newHappening.title
                it[happeningType] = newHappening.type.toString()
                it[registrationDate] = DateTime(newHappening.registrationDate)
                it[happeningDate] = DateTime(newHappening.happeningDate)
                it[studentGroupName] = newHappening.studentGroupName.lowercase()
                it[studentGroupRegistrationDate] = DateTime(newHappening.studentGroupRegistrationDate)
            }
            SpotRange.batchInsert(newHappening.spotRanges) { sr ->
                this[SpotRange.spots] = sr.spots
                this[SpotRange.minDegreeYear] = sr.minDegreeYear
                this[SpotRange.maxDegreeYear] = sr.maxDegreeYear
                this[SpotRange.happeningSlug] = newHappening.slug
            }
            StudentGroupHappeningRegistration.batchInsert(newHappening.studentGroups) { sg ->
                this[StudentGroupHappeningRegistration.happeningSlug] = newHappening.slug
                this[StudentGroupHappeningRegistration.studentGroupName] = sg
            }
        }

        return Pair(
            HttpStatusCode.OK,
            "${newHappening.type.toString().lowercase()} submitted with slug = ${newHappening.slug}.",
        )
    }

    if (happening[Happening.slug] == newHappening.slug &&
        happening[Happening.title] == newHappening.title &&
        DateTime(happening[Happening.registrationDate]) == DateTime(newHappening.registrationDate) &&
        DateTime(happening[Happening.happeningDate]) == DateTime(newHappening.happeningDate) &&
        spotRanges == newHappening.spotRanges &&
        happening[Happening.studentGroupName]?.lowercase() == newHappening.studentGroupName.lowercase() &&
        happening[Happening.studentGroupRegistrationDate] == DateTime(newHappening.studentGroupRegistrationDate) &&
        studentGroups == newHappening.studentGroups &&
        happening[Happening.onlyForStudentGroups] == newHappening.onlyForStudentGroups
    ) {
        val message =
            """
            Happening with
            slug = ${newHappening.slug},
            title = ${newHappening.title},
            registrationDate = ${newHappening.registrationDate},
            happeningDate = ${newHappening.happeningDate},
            spotRanges = ${spotRangesToString(newHappening.spotRanges)},
            studentGroupRegistrationDate = ${newHappening.studentGroupRegistrationDate},
            studentGroups = ${newHappening.studentGroups.joinToString(",", prefix = "[", postfix = "[")},
            onlyForStudentGroups = ${newHappening.onlyForStudentGroups}
            and studentGroupName = ${newHappening.studentGroupName} has already been submitted."
            """.trimIndent()

        return Pair(
            HttpStatusCode.Accepted,
            message,
        )
    }

    transaction {
        Happening.update({ Happening.slug eq newHappening.slug }) {
            it[title] = newHappening.title
            it[registrationDate] = DateTime(newHappening.registrationDate)
            it[happeningDate] = DateTime(newHappening.happeningDate)
            it[studentGroupName] = newHappening.studentGroupName.lowercase()
            it[studentGroupRegistrationDate] = DateTime(newHappening.studentGroupRegistrationDate)
            it[onlyForStudentGroups] = newHappening.onlyForStudentGroups ?: false
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

        StudentGroupHappeningRegistration.deleteWhere {
            StudentGroupHappeningRegistration.happeningSlug eq newHappening.slug
        }

        StudentGroupHappeningRegistration.batchInsert(newHappening.studentGroups) { sg ->
            this[StudentGroupHappeningRegistration.happeningSlug] = newHappening.slug
            this[StudentGroupHappeningRegistration.studentGroupName] = sg
        }
    }

    val message =
        """
        Updated ${newHappening.type} with slug = ${newHappening.slug} to
        title = ${newHappening.title},
        registrationDate = ${newHappening.registrationDate},
        happeningDate = ${newHappening.happeningDate},
        spotRanges = ${spotRangesToString(newHappening.spotRanges)},
        studentGroupRegistrationDate = ${newHappening.studentGroupRegistrationDate},
        studentGroups = ${newHappening.studentGroups.joinToString(",", prefix = "[", postfix = "]")}
        and studentGroupName = ${newHappening.studentGroupName}.
        """.trimIndent()

    return Pair(
        HttpStatusCode.OK,
        message,
    )
}

fun spotRangesToString(spotRanges: List<SpotRangeJson>): String {
    return "[ ${
        spotRanges.map {
            "(spots = ${it.spots}, minDegreeYear = ${it.minDegreeYear}, maxDegreeYear = ${it.maxDegreeYear}), "
        }
    } ]"
}
