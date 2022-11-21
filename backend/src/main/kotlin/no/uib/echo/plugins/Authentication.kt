package no.uib.echo.plugins

import com.auth0.jwk.JwkProviderBuilder
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.auth.Authentication
import io.ktor.server.auth.UserIdPrincipal
import io.ktor.server.auth.basic
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.jwt.jwt
import java.net.URL
import java.util.concurrent.TimeUnit

fun Application.configureAuthentication(adminKey: String) {
    install(Authentication) {
        basic("auth-admin") {
            realm = "Access to registrations and happenings."
            validate { credentials ->
                if (credentials.name == "admin" && credentials.password == adminKey) {
                    UserIdPrincipal(credentials.name)
                } else {
                    null
                }
            }
        }

        val issuer = "https://auth.dataporten.no/openid/jwks"
        val jwkProvider = JwkProviderBuilder(URL(issuer))
            .cached(10, 24, TimeUnit.HOURS)
            .rateLimited(10, 1, TimeUnit.MINUTES)
            .build()

        jwt("auth-jwt") {
            realm = "Verify jwt"
            verifier(jwkProvider, issuer) {
                acceptLeeway(10)
                withIssuer("https://auth.dataporten.no")
            }
            validate { jwtCredential ->
                JWTPrincipal(jwtCredential.payload)
            }
        }
    }
}
