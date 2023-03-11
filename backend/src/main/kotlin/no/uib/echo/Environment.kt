package no.uib.echo

enum class Environment {
    PRODUCTION,
    DEVELOPMENT,
    PREVIEW
}

fun String.toEnvironment(): Environment {
    return when (val envLower = this.lowercase()) {
        "production" -> Environment.PRODUCTION
        "development" -> Environment.DEVELOPMENT
        "preview" -> Environment.PREVIEW
        else -> throw Exception("Invalid ENVIRONMENT variable. Got '$envLower'.")
    }
}

data class FeatureToggles(
    val sendEmailReg: Boolean
)
