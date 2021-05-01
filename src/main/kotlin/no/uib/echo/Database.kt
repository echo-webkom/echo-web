package no.uib.echo

import com.zaxxer.hikari.*
import io.ktor.http.HttpStatusCode
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.jodatime.CurrentDateTime
import org.jetbrains.exposed.sql.jodatime.datetime
import org.jetbrains.exposed.sql.transactions.transaction
import org.joda.time.DateTime
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
    val terms: Boolean,
    val submitDate: String?
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
    val spots = integer("spots")
    val registrationDate = datetime("registrationDate")

    override val primaryKey = PrimaryKey(slug)
}

fun selectRegistrations(
    emailParam: String?,
    slugParam: String?
): List<RegistrationJson>? {
    val q = selectRegistrationsQuery(emailParam, slugParam)

    if (q != null) {
        val result = transaction {
            addLogger(StdOutSqlLogger)

            q.toList()
        }

        return (result.map { reg ->
            RegistrationJson(
                reg[Registration.email],
                reg[Registration.firstName],
                reg[Registration.lastName],
                Degree.valueOf(reg[Registration.degree]),
                reg[Registration.degreeYear],
                reg[Registration.bedpresSlug],
                reg[Registration.terms],
                reg[Registration.submitDate].toString()
            )
        })
    } else {
        return null
    }
}

fun selectRegistrationsQuery(emailParam: String?, slugParam: String?): Query? {
    if (emailParam != null && slugParam != null) {
        return Registration.select { Registration.email eq emailParam and (Registration.bedpresSlug eq slugParam) }
    } else if (emailParam != null && slugParam == null) {
        return Registration.select { Registration.email eq emailParam }
    } else if (emailParam == null && slugParam != null) {
        return Registration.select { Registration.bedpresSlug eq slugParam }
    }
    return null
}

fun insertRegistration(reg: RegistrationJson) {
    transaction {
        addLogger(StdOutSqlLogger)

        Registration.insert {
            it[email] = reg.email
            it[firstName] = reg.firstName
            it[lastName] = reg.lastName
            it[degree] = reg.degree.toString()
            it[degreeYear] = reg.degreeYear
            it[bedpresSlug] = reg.slug
            it[terms] = reg.terms
        }
    }
}

fun deleteRegistration(shortReg: ShortRegistrationJson) {
    transaction {
        addLogger(StdOutSqlLogger)

        Registration.deleteWhere { Registration.bedpresSlug eq shortReg.slug and (Registration.email eq shortReg.email) }
    }
}

fun insertOrUpdateBedpres(newBedpres: BedpresJson): Pair<HttpStatusCode, String> {
    val bedpresList = transaction {
        addLogger(StdOutSqlLogger)

        Bedpres.select { Bedpres.slug eq newBedpres.slug }.toList()
    }

    if (bedpresList.isEmpty()) {
        transaction {
            addLogger(StdOutSqlLogger)

            Bedpres.insert {
                it[Bedpres.slug] = newBedpres.slug
                it[Bedpres.spots] = newBedpres.spots
                it[Bedpres.registrationDate] = DateTime(newBedpres.registrationDate)
            }
        }

        return Pair(HttpStatusCode.OK, "Bedpres submitted.")
    }

    val bedpres = bedpresList[0]

    if (bedpres[Bedpres.slug] == newBedpres.slug && bedpres[Bedpres.spots] == newBedpres.spots) {
        return Pair(HttpStatusCode.Accepted, "Bedpres with slug = ${newBedpres.slug} has already been submitted.")
    }

    transaction {
        addLogger(StdOutSqlLogger)

        Bedpres.update({ Bedpres.slug eq newBedpres.slug }) {
            it[spots] = newBedpres.spots
        }
    }

    return Pair(
        HttpStatusCode.OK,
        "Updated bedpres with slug = ${newBedpres.slug} to spots = ${newBedpres.spots}."
    )
}

fun deleteBedpresBySlug(slug: BedpresSlugJson) {
    transaction {
        addLogger(StdOutSqlLogger)

        Bedpres.deleteWhere { Bedpres.slug eq slug.slug }
    }
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