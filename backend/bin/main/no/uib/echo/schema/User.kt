package no.uib.echo.schema

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table

@Serializable
data class UserJson(
    val email: String,
    val degreeYear: Int,
    val degree: Degree,
)

object User : Table() {
    val email: Column<String> = text("email")
    val degreeYear: Column<Int> = integer("degree_year")
    val degree: Column<String> = text("degree")

    override val primaryKey: PrimaryKey = PrimaryKey(email)
}
