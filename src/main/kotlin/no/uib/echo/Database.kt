package no.uib.echo

import com.zaxxer.hikari.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.jodatime.CurrentDateTime
import org.jetbrains.exposed.sql.jodatime.datetime
import org.jetbrains.exposed.sql.transactions.transaction
import java.net.URI

object Db {
    private fun dataSource(): HikariDataSource {
        if (System.getenv("DEV") != null) {
            val dbHost = System.getenv("DATABASE_HOST") ?: throw Exception("DATABASE_HOST not defined.")

            return HikariDataSource(HikariConfig().apply {
                jdbcUrl = "jdbc:postgresql://$dbHost:5432/postgres"
                username = "postgres"
                password = "password"
                driverClassName = "org.postgresql.Driver"
                connectionTimeout = 1000
                maximumPoolSize = 10
            })
        }

        val dbUri = URI(System.getenv("DATABASE_URL") ?: throw Exception("DATABASE_URL not defined."))

        val dbUrl = "jdbc:postgresql://" + dbUri.host + ':' + dbUri.port + dbUri.path
            .toString() + "?sslmode=require"
        val dbUsername: String = dbUri.userInfo.split(":")[0]
        val dbPassword: String = dbUri.userInfo.split(":")[1]

        return HikariDataSource(HikariConfig().apply {
            jdbcUrl = dbUrl
            username = dbUsername
            password = dbPassword
            driverClassName = "org.postgresql.Driver"
            connectionTimeout = 1000
            maximumPoolSize = 10
        })
    }

    val conn by lazy {
        Database.connect(dataSource())
    }

    fun init() {
        transaction(conn) {
            SchemaUtils.create(Bedpres, Registration)
        }
    }
}

data class RegistrationJson(
    val email: String,
    val firstName: String,
    val lastName: String,
    val degree: Degree,
    val degreeYear: Int,
    val slug: String,
    val terms: Boolean
)

data class ShortRegistrationJson(val slug: String, val email: String)

data class BedpresJson(val slug: String, val spots: Int, val registrationDate: String)
data class BedpresSlugJson(val slug: String)

object Registration : Table() {
    val email = varchar("email", 40)
    val firstName = varchar("firstName", 40)
    val lastName = varchar("lastName", 40)
    val degree = varchar("degree", 50)
    val degreeYear = integer("degreeYear")
    val bedpresSlug = varchar("bedpresSlug", 40) references Bedpres.slug
    val terms = bool("terms")
    val submitDate = datetime("submitDate").defaultExpression(CurrentDateTime())

    override val primaryKey = PrimaryKey(email, bedpresSlug)
}

object Bedpres : Table() {
    val slug = varchar("slug", 40).uniqueIndex()
    var spots = integer("spots")
    val registrationDate = datetime("registrationDate")

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