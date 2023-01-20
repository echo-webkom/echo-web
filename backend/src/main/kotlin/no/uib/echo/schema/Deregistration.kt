package no.uib.echo.schema

import kotlinx.serialization.Serializable
import no.uib.echo.schema.Registration.defaultExpression
import org.jetbrains.exposed.sql.Column
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.jodatime.CurrentDateTime
import org.jetbrains.exposed.sql.jodatime.datetime
import org.joda.time.DateTime


@Serializable
    data class FormDeregistrationJson(
        val email: String,
        val slug: String,
        val reason: String,
    )


    object Deregistration : Table() {
        val userEmail: Column<String> = text("user_email") references User.email
        val happeningSlug: Column<String> = text("happening_slug") references Happening.slug
        val submitDate: Column<DateTime> = datetime("submit_date").defaultExpression(CurrentDateTime)
        val reason: Column<String> = text("reason")


        override val primaryKey: PrimaryKey = PrimaryKey(userEmail, happeningSlug)
    }

