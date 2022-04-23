package no.uib.echo

import kotlinx.serialization.Serializable

@Serializable
data class SlugRequest(
    val slugs: List<String>
)