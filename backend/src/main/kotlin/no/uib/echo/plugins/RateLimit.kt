package no.uib.echo.plugins

import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.plugins.ratelimit.RateLimit
import kotlin.time.Duration.Companion.seconds

fun Application.configureRateLimit() {
    install(RateLimit) {
        global {
            rateLimiter(limit = 200, refillPeriod = 60.seconds)
        }
    }
}
