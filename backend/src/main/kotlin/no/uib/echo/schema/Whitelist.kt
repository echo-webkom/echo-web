package no.uib.echo.schema

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.jodatime.datetime

@Serializable
data class WhitelistJson(
    val email: String,
    val expiresAt: String,
)

object Whitelist : Table("whitelist") {
    val email = text("email")
    val expiresAt = datetime("expires_at")

    override val primaryKey = PrimaryKey(email)
}
