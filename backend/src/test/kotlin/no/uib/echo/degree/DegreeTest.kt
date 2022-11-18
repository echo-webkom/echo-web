package no.uib.echo.degree

import io.kotest.matchers.shouldBe
import no.uib.echo.schema.Degree
import no.uib.echo.schema.nullableDegreeToString
import no.uib.echo.schema.nullableStringToDegree
import kotlin.test.Test

class DegreeTest {
    @Test
    fun toAndFromDegreeTest() {
        for (deg in Degree.values()) {
            nullableStringToDegree(nullableDegreeToString(deg)) shouldBe deg
        }

        nullableStringToDegree(nullableDegreeToString(null)) shouldBe null
        nullableStringToDegree(null) shouldBe null
        nullableDegreeToString(null) shouldBe null
    }
}
