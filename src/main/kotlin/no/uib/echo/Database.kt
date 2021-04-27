package no.uib.echo

import org.jetbrains.exposed.sql.*
import com.zaxxer.hikari.*
import com.zaxxer.hikari.hibernate.HikariConfigurationUtil
import org.jetbrains.exposed.sql.transactions.transaction
import javax.sql.DataSource

object Db {
    val dataSource = HikariDataSource(HikariConfig().apply {
        jdbcUrl = "jdbc:pgsql://0.0.0.0:5432,127.0.0.1:5432/postgres"
        username = "postgres"
        password = "password"
        driverClassName = "com.impossibl.postgres.jdbc.PGDriver"
    })

    val connection by lazy {
        Database.connect(dataSource)
    }

    fun init() {
        transaction(connection) {
            SchemaUtils.create(Bedpres, Registration, Student)
        }
    }
}

class FullRegistrationJson(
    val email: String,
    val firstName: String,
    val lastName: String,
    val degree: Degree,
    val slug: String,
    val terms: Boolean
)

data class BedpresJson(val slug: String, val spots: Int)

object Registration : Table() {
    val studentEmail = varchar("studentEmail", 40) references Student.email
    val bedpresSlug = varchar("bedpresSlug", 40) references Bedpres.slug
    val terms = bool("terms")

    override val primaryKey = PrimaryKey(studentEmail, bedpresSlug)
}

object Student : Table() {
    val email = varchar("email", 40).uniqueIndex()
    val firstName = varchar("firstName", 40)
    val lastName = varchar("lastName", 40)
    val degree = varchar("degree", 66)

    override val primaryKey = PrimaryKey(email)
}

object Bedpres : Table() {
    val slug = varchar("slug", 40).uniqueIndex()
    var spots = integer("spots")

    override val primaryKey = PrimaryKey(slug)
}

enum class Degree {
    DTEK,
    DSIK,
    DVIT
}