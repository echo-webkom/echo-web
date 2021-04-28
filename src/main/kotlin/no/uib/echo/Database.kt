package no.uib.echo

import org.jetbrains.exposed.sql.*
import com.zaxxer.hikari.*
import org.jetbrains.exposed.sql.transactions.transaction

object Db {
    fun dataSource(dbHost: String): HikariDataSource {
        return HikariDataSource(HikariConfig().apply {
            jdbcUrl = "jdbc:postgresql://$dbHost:5432/postgres"
            username = "postgres"
            password = "password"
            driverClassName = "org.postgresql.Driver"
        })
    }

    fun connection(dbHost: String): Database {
        return Database.connect(dataSource(dbHost))
    }

    fun init(dbHost: String) {
        transaction(connection(dbHost)) {
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