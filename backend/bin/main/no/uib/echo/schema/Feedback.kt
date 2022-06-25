package no.uib.echo.schema

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table

@Serializable data class FeedbackJson(val email: String, val name: String, val message: String)

object Feedback : Table() {
    private val id: Column<Int> = integer("id").uniqueIndex().autoIncrement()
    val email: Column<String> = text("happening_slug")
    val name: Column<String> = text("name")
    val message: Column<String> = text("message")

    override val primaryKey: PrimaryKey = PrimaryKey(id)
}
