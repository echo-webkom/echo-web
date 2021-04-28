package no.uib.echo

import org.jetbrains.exposed.sql.*
import com.zaxxer.hikari.*
import org.jetbrains.exposed.sql.transactions.transaction

object Db {
    fun connection(dbString: String, dev: Boolean = false): Database {
        if (dev) {
            return Database.connect(HikariDataSource(HikariConfig().apply {
                jdbcUrl = "jdbc:postgresql://$dbString:5432/postgres"
                username = "postgres"
                password = "password"
                driverClassName = "org.postgresql.Driver"
            }))
        }
        return Database.connect(HikariDataSource(HikariConfig().apply {
            jdbcUrl = dbString
            driverClassName = "org.postgresql.Driver"
        }))
    }

    fun init(dbHost: String, dev: Boolean = false) {
        transaction(connection(dbHost, dev)) {
            SchemaUtils.create(Bedpres, Registration)
        }
    }
}

class RegistrationJson(
    val email: String,
    val firstName: String,
    val lastName: String,
    val degree: Degree,
    val degreeYear: Int,
    val slug: String,
    val terms: Boolean
)

data class BedpresJson(val slug: String, val spots: Int)

object Registration : Table() {
    val email = varchar("email", 40)
    val firstName = varchar("firstName", 40)
    val lastName = varchar("lastName", 40)
    val degree = varchar("degree", 50)
    val degreeYear = integer("degreeYear")
    val bedpresSlug = varchar("bedpresSlug", 40) references Bedpres.slug
    val terms = bool("terms")

    override val primaryKey = PrimaryKey(email, bedpresSlug)
}

object Bedpres : Table() {
    val slug = varchar("slug", 40).uniqueIndex()
    var spots = integer("spots")

    override val primaryKey = PrimaryKey(slug)
}

enum class Degree {
    DTEK,
    DSIK,
    DVIT,
    BINF,
    IMØ,
    IKT,
    KOGNI,
    INF,
    PROG,
    ÅRMNINF,
    POST,
    MISC,
}