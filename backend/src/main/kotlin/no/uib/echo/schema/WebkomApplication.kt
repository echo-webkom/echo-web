package no.uib.echo.schema

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table

@Serializable
data class WebkomApplicationJson(
    val email: String,
    val name: String,
    val degree_year: Int,
    val degree: Degree,
    val message: String
)

object WebkomApplication : Table() {
    val email: Column<String> = text("email").uniqueIndex()
    val name: Column<String> = text("name")
    val degree_year: Column<Int> = integer("degree_year")
    val degree: Column<String> = text("degree")
    val message: Column<String> = text("message")

    override val primaryKey: PrimaryKey = PrimaryKey(email)
}
