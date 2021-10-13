package no.uib.echo

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import no.uib.echo.schema.*
import org.flywaydb.core.Flyway
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.statements.api.IdentifierManagerApi
import org.jetbrains.exposed.sql.transactions.TransactionManager
import org.jetbrains.exposed.sql.transactions.transaction
import java.net.URI

object Db {
    private val dbUri = URI(System.getenv("DATABASE_URL") ?: throw Exception("DATABASE_URL not defined."))
    private val dev = System.getenv("DEV") != null

    private val dbPort = if (dbUri.port == -1) 5432 else dbUri.port
    private val dbUrl = "jdbc:postgresql://${dbUri.host}:${dbPort}${dbUri.path}"
    private val dbUsername = dbUri.userInfo.split(":")[0]
    private val dbPassword = dbUri.userInfo.split(":")[1]

    private fun dataSource(): HikariDataSource {
        return HikariDataSource(HikariConfig().apply {
            jdbcUrl = dbUrl
            username = dbUsername
            password = dbPassword
            driverClassName = "org.postgresql.Driver"
            connectionTimeout = 1000
            maximumPoolSize = if (dev || System.getenv("LOWER_MAX_CONN") != null) 10 else 90
        })
    }

    private fun migrate() {
        Flyway.configure().baselineOnMigrate(true).dataSource(dbUrl, dbUsername, dbPassword).load().migrate()
    }

    private val conn by lazy {
        Database.connect(dataSource())
    }

    fun init() {
        // Don't migrate if running on local machine
        if (!dev)
            migrate()
        try {
            transaction(conn) {
                SchemaUtils.create(
                    Happening,
                    Registration,
                    Answer,
                    SpotRange
                )
            }
        } catch (e : Exception) {
            println("Assuming all tables already exists, and continuing anyway.")
        }

        // For Answer FK's
        try {
            transaction {
                val t3 = TransactionManager.current()
                val fk3 = t3.foreignKeyCompositeConstraint(
                    mapOf(
                        Answer.happeningSlug to Registration.happeningSlug,
                        Answer.registrationEmail to Registration.email
                    ),
                    ReferenceOption.RESTRICT,
                    ReferenceOption.RESTRICT
                )
                t3.exec(fk3.createStatement().first())
            }
        } catch (e: Exception) {
            println("Could not create foreign keys for Answer. Assuming they already exist, and continuing anyway.")
        }
    }

    // Workaround from https://github.com/JetBrains/Exposed/issues/511
    private fun Transaction.foreignKeyCompositeConstraint(
        columnsReferences: Map<Column<*>, Column<*>>,
        onUpdate: ReferenceOption?,
        onDelete: ReferenceOption?,
        name: String? = null,
    ): ForeignKeyConstraint {
        val fromColumns = columnsReferences.keys
        val fromTable = fromColumns.first().table
        require(fromColumns.all { it.table == fromTable }) { "All referencing columns must belong to the same table" }
        val targetColumns = columnsReferences.values
        val targetTable = targetColumns.first().table
        require(targetColumns.all { it.table == targetTable }) { "All referenced columns must belong to the same table" }

        // this API is private, so redeclare it as an extension method
        fun IdentifierManagerApi.quote(identity: String) = "$quoteString$identity$quoteString".trim()

        val virtualColumnOf = { columns: Iterable<Column<*>> ->
            val someColumn = columns.first()
            val columnsIdentities = columns.joinToString(",") { db.identifierManager.quote(identity(it)) }
            Column<Any>(someColumn.table, columnsIdentities, someColumn.columnType)
        }

        fun Iterable<Column<*>>.joinNamesToString() = joinToString("_") { it.name }

        return ForeignKeyConstraint(
            target = virtualColumnOf(targetColumns),
            from = virtualColumnOf(fromColumns),
            onUpdate = onUpdate,
            onDelete = onDelete,
            name = name ?: "fk_${fromTable.tableName.substringAfter(".")}_${fromColumns.joinNamesToString()}__${targetColumns.joinNamesToString()}"
        )
    }
}
