package no.uib.echo.schema

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table

@Serializable
data class UserJson(
    val email: String,
    val alternateEmail: String? = null,
    val degreeYear: Int,
    val degree: Degree,
)

object User : Table() {
    val email: Column<String> = text("email")
    val alternateEmail: Column<String?> = text("alternate_email").nullable()
    val degreeYear: Column<Int> = integer("degree_year")
    val degree: Column<String> = text("degree")

    override val primaryKey: PrimaryKey = PrimaryKey(email)
}
