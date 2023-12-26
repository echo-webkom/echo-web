package no.uib.echo.lib

import no.uib.echo.schema.Degree
import org.junit.jupiter.api.Test

data class TestCase(
    val degree: Degree?,
    val degreeYear: Int?,
    val expected: Boolean,
)

class UserValidationTest {
    companion object {
        val cases =
            listOf(
                TestCase(Degree.DTEK, 1, true),
                TestCase(Degree.DTEK, 4, false),
                TestCase(Degree.DTEK, null, false),
                TestCase(null, 1, false),
                TestCase(null, null, false),
                TestCase(Degree.ARMNINF, 1, true),
                TestCase(Degree.ARMNINF, 2, false),
                TestCase(Degree.DSC, 1, true),
                TestCase(Degree.DSC, 4, true),
            )
    }

    @Test
    fun `validateDegreeAndDegreeYear should return expected`() {
        cases.forEach {
            assert(UserValidation.validateDegreeAndDegreeYear(it.degree, it.degreeYear) == it.expected)
        }
    }
}
