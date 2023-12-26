package no.uib.echo.schema

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.jodatime.CurrentDateTime
import org.jetbrains.exposed.sql.jodatime.datetime
import org.joda.time.DateTime

@Serializable
data class FeedbackJson(val email: String?, val name: String?, val message: String)

@Serializable
data class FeedbackResponseJson(
    val id: Int,
    val email: String?,
    val name: String?,
    val message: String,
    val sentAt: String,
    val isRead: Boolean,
)

enum class FeedbackResponse {
    EMPTY,
    SUCCESS,
}

object Feedback : Table() {
    val id: Column<Int> = integer("id").uniqueIndex().autoIncrement()
    val email: Column<String?> = text("email").nullable()
    val name: Column<String?> = text("name").nullable()
    val message: Column<String> = text("message")
    val sentAt: Column<DateTime> = datetime("sent_at").defaultExpression(CurrentDateTime)
    val isRead: Column<Boolean> = bool("is_read").default(false)

    override val primaryKey: PrimaryKey = PrimaryKey(id)
}
