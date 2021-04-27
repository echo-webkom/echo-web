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

data class RegistrationJson(val email: String, val slug: String, val terms: Boolean)
data class BedpresJson(val slug: String, val spots: Int)
data class StudentJson(val email: String, val firstName: String, val lastName: String, val degree: Degree)

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
    val degree = varchar("degree", 50)

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