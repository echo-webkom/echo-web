package no.uib.echo.routes

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.auth.authenticate
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import no.uib.echo.schema.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction

fun Application.happeningRoutes() {
    routing {
        authenticate("auth-admin") {
            deleteHappening()
            getHappeningInfo()
        }
    }
}

fun Route.deleteHappening() {
    delete("/happening/{slug}") {
        val slug = call.parameters["slug"]

        if (slug == null) {
            call.respond(HttpStatusCode.BadRequest, "No slug specified.")
            return@delete
        }

        val hapDeleted = transaction {
            val happeningExists = Happening.select { Happening.slug eq slug }.firstOrNull() != null
            if (!happeningExists) {
                return@transaction false
            }

            SpotRange.deleteWhere {
                SpotRange.happeningSlug eq slug
            }

            Answer.deleteWhere {
                Answer.happeningSlug eq slug
            }

            Registration.deleteWhere {
                Registration.happeningSlug eq slug
            }

            StudentGroupHappeningRegistration.deleteWhere {
                StudentGroupHappeningRegistration.happeningSlug eq slug
            }

            Happening.deleteWhere {
                Happening.slug eq slug
            }

            return@transaction true
        }

        if (hapDeleted) {
            call.respond(
                HttpStatusCode.OK,
                "Happening with slug = $slug deleted."
            )
        } else {
            call.respond(
                HttpStatusCode.NotFound,
                "Happening with slug = $slug does not exist."
            )
        }
    }
}

fun Route.getHappeningInfo() {
    get("/happening/{slug}") {
        val slug = call.parameters["slug"]

        if (slug == null) {
            call.respond(HttpStatusCode.BadRequest, "No slug specified.")
            return@get
        }

        val happening = transaction {
            Happening.select {
                Happening.slug eq slug
            }.firstOrNull()
        }

        if (happening == null) {
            call.respond(HttpStatusCode.NotFound, "Happening doesn't exist.")
            return@get
        }

        val registrationCount = transaction {
            SpotRange.select {
                SpotRange.happeningSlug eq slug
            }.toList().map {
                val count =
                    countRegistrationsDegreeYear(
                        slug,
                        it[SpotRange.minDegreeYear]..it[SpotRange.maxDegreeYear],
                        Status.REGISTERED,
                    )

                val waitListCount =
                    countRegistrationsDegreeYear(
                        slug,
                        it[SpotRange.minDegreeYear]..it[SpotRange.maxDegreeYear],
                        Status.WAITLIST,
                    )

                SpotRangeWithCountJson(
                    it[SpotRange.spots],
                    it[SpotRange.minDegreeYear],
                    it[SpotRange.maxDegreeYear],
                    count,
                    waitListCount,
                )
            }
        }

        val totalCount = countRegistrationsDegreeYear(slug, 1..5, Status.WAITLIST)

        val totalCountDiff = totalCount - registrationCount.sumOf { it.regCount }
        if (totalCountDiff > 0) {
            val newRegistrationCount = listOf(
                registrationCount.first().copy(regCount = registrationCount.first().regCount + totalCountDiff)
            ) + registrationCount.drop(1)

            call.respond(HttpStatusCode.OK, HappeningInfoJson(newRegistrationCount))
        }

        call.respond(
            HttpStatusCode.OK,
            HappeningInfoJson(
                registrationCount
            )
        )
    }
}
