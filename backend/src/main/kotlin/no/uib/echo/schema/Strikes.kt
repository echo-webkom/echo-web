package no.uib.echo.schema

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.jodatime.CurrentDateTime
import org.jetbrains.exposed.sql.jodatime.datetime
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.joda.time.DateTime

@Serializable
data class StrikesJson(
    val userEmail: String,
    val reason: String,
    val createdAt: String,
    val modifiedAt: String
)

object Strikes : Table() {
    val userEmail: Column<String> = text("user_email") references User.email
    val reason: Column<String?> = text("reason").nullable()
    val createdAt: Column<DateTime> = datetime("created_at").defaultExpression(CurrentDateTime)
    val modifiedAt: Column<DateTime> = datetime("modified_at").defaultExpression(CurrentDateTime)

    override val primaryKey: PrimaryKey = PrimaryKey(userEmail)
}
