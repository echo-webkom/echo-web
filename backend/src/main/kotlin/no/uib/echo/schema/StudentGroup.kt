package no.uib.echo.schema

import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.or
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction

val validStudentGroups = listOf("webkom", "bedkom", "gnist", "tilde", "hovedstyret", "hyggkom", "esc", "makerspace", "programmerbar")

object StudentGroup : Table("student_group") {
    val name: Column<String> = text("group_name").check("valid_student_group") {
        it inList validStudentGroups
    }

    override val primaryKey: PrimaryKey = PrimaryKey(name)
}

object StudentGroupMembership : Table("student_group_membership") {
    val userEmail: Column<String> = text("user_email") references User.email
    val studentGroupName: Column<String> = text("student_group_name") references StudentGroup.name

    override val primaryKey: PrimaryKey = PrimaryKey(studentGroupName, userEmail)
}

fun getGroupMembers(group: String?): List<String> {
    if (group == null) {
        return emptyList()
    }

    return transaction {
        StudentGroupMembership.select {
            StudentGroupMembership.studentGroupName eq group.lowercase() or
                (StudentGroupMembership.studentGroupName eq "webkom")
        }.toList().map { it[StudentGroupMembership.userEmail].lowercase() }
    }
}

fun _getGroupMembers(group: String?): List<String> {
    if (group == null) {
        return emptyList()
    }

    return transaction {
        StudentGroupMembership.select {
            StudentGroupMembership.studentGroupName eq group.lowercase()
        }.toList().map { it[StudentGroupMembership.userEmail].lowercase() }
    }
}

fun getUserStudentGroups(email: String): List<String> = transaction {
    StudentGroupMembership.select {
        StudentGroupMembership.userEmail eq email
    }.toList().map {
        it[StudentGroupMembership.studentGroupName]
    }.ifEmpty {
        emptyList()
    }
}
