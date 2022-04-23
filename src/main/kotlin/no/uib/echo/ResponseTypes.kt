package no.uib.echo

import kotlinx.serialization.Serializable

@Serializable
data class RegistrationCount (
    val slug: String,
    val count: Long
)