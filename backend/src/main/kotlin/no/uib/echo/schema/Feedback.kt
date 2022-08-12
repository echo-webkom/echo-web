package no.uib.echo.schema

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table

@Serializable
data class FeedbackJson(val email: String?, val name: String?, val message: String)

@Serializable
data class FeedbackResponseJson(val email: String?, val name: String?, val message: String, val sent: String)

enum class FeedbackResponse {
    EMPTY,
    SUCCESS,
}

object Feedback : Table() {
    private val id: Column<Int> = integer("id").uniqueIndex().autoIncrement()
    val email: Column<String?> = text("email").nullable()
    val name: Column<String?> = text("name").nullable()
    val message: Column<String> = text("message")
    val sent: Column<String> = text("sent")

    override val primaryKey: PrimaryKey = PrimaryKey(id)
}
