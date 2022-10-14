package no.uib.echo.schema

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table

@Serializable
data class UserJson(
    val email: String,
    val name: String,
    val alternateEmail: String? = null,
    val degreeYear: Int? = null,
    val degree: Degree? = null,
    val memberships: List<String> = emptyList()
)

object User : Table() {
    val email: Column<String> = text("email")
    val name: Column<String> = text("name")
    val alternateEmail: Column<String?> = text("alternate_email").nullable()
    val degreeYear: Column<Int?> = integer("degree_year").nullable()
    val degree: Column<String?> = text("degree").nullable()

    override val primaryKey: PrimaryKey = PrimaryKey(email)
}
