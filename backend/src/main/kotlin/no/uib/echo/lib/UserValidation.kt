package no.uib.echo.lib

import no.uib.echo.schema.Degree
import no.uib.echo.schema.bachelors
import no.uib.echo.schema.masters

object UserValidation {
    fun validateDegreeAndDegreeYear(
        degree: Degree?,
        degreeYear: Int?,
    ): Boolean {
        if (degreeYear == null || degree == null) {
            return false
        }

        return (degree in bachelors && degreeYear in 1..3) ||
            (degree in masters && degreeYear in 4..5) ||
            (degree == Degree.ARMNINF && degreeYear == 1)
    }
}
