package no.uib.echo

import io.kotest.core.config.AbstractProjectConfig
import io.kotest.core.extensions.Extension

class KotestProjectConfig : AbstractProjectConfig() {
    override fun extensions(): List<Extension> {
        return listOf(InitDatabase())
    }
}
