package no.uib.echo

import kotlinx.serialization.Serializable
import no.uib.echo.schema.SpotRangeJson

@Serializable
data class RegistrationResponseJson(val code: RegistrationResponse, val title: String, val desc: String, val date: String? = null)

enum class RegistrationResponse {
    NotSignedIn,
    InvalidDegree,
    InvalidDegreeYear,
    DegreeYearMismatch,
    AlreadySubmitted,
    AlreadySubmittedWaitList,
    HappeningDoesntExist,
    OnlyOpenForStudentGroups,
    TooEarly,
    TooLate,
    WaitList,
    NotInRange,
    OK
}

fun resToJson(
    res: RegistrationResponse,
    regDate: String? = null,
    spotRanges: List<SpotRangeJson>? = null,
    waitListSpot: Long? = null,
    studentGroups: List<String>? = null,
): RegistrationResponseJson {
    when (res) {
        RegistrationResponse.NotSignedIn ->
            return RegistrationResponseJson(res, "Du er ikke logget inn.", "Vennligst logg inn før du fortsetter.")
        RegistrationResponse.InvalidDegree ->
            return RegistrationResponseJson(res, "Vennligst velg en studieretning.", "")
        RegistrationResponse.InvalidDegreeYear ->
            return RegistrationResponseJson(res, "Vennligst velg et gyldig trinn.", "")
        RegistrationResponse.DegreeYearMismatch ->
            return RegistrationResponseJson(res, "Årstrinn og studiretning stemmer ikke overens.", "Vennligst gå inn på profilen din og endre til riktig informasjon.")
        RegistrationResponse.AlreadySubmitted ->
            return RegistrationResponseJson(res, "Du er allerede påmeldt.", "Du har allerede fått plass.")
        RegistrationResponse.AlreadySubmittedWaitList ->
            return RegistrationResponseJson(res, "Du er allerede påmeldt.", "Du er på ventelisten.")
        RegistrationResponse.TooEarly ->
            return RegistrationResponseJson(res, "Påmeldingen er ikke åpen enda.", "Vennligst vent.", regDate)
        RegistrationResponse.TooLate ->
            return RegistrationResponseJson(res, "Påmeldingen er stengt.", "Det er ikke mulig å melde seg på lenger.", regDate)
        RegistrationResponse.WaitList -> {
            val desc = when (waitListSpot) {
                null -> "Du har blitt satt på ventelisten, og vil bli kontaktet om det åpner seg en ledig plass."
                else -> "Du er på plass nr. $waitListSpot på ventelisten, og vil bli kontaktet om det åpner seg en ledig plass."
            }
            return RegistrationResponseJson(
                res,
                "Alle plassene er dessverre fylt opp.",
                desc
            )
        }
        RegistrationResponse.HappeningDoesntExist ->
            return RegistrationResponseJson(
                res,
                "Dette arrangementet finnes ikke.",
                "Om du mener dette ikke stemmer, ta kontakt med Webkom."
            )
        RegistrationResponse.OnlyOpenForStudentGroups ->
            return RegistrationResponseJson(
                res,
                "Du kan ikke melde deg på.",
                "Dette arrangementet er kun åpent for ${studentGroups?.joinToString(", ") ?: "visse studentgrupper"}."
            )
        RegistrationResponse.NotInRange -> {
            var desc = "Dette arrangementet er kun åpent for "
            if (spotRanges != null) {
                when (spotRanges.size) {
                    1 ->
                        desc += "${spotRanges[0].minDegreeYear}. til ${spotRanges[0].maxDegreeYear}. trinn."
                    2 ->
                        desc += "${spotRanges[0].minDegreeYear}. til ${spotRanges[0].maxDegreeYear}. trinn, " +
                            "og ${spotRanges[1].minDegreeYear}. til ${spotRanges[1].maxDegreeYear}. trinn. "
                    3 ->
                        desc += "${spotRanges[0].minDegreeYear}. til ${spotRanges[0].maxDegreeYear}. trinn, " +
                            "${spotRanges[1].minDegreeYear}. til ${spotRanges[1].maxDegreeYear}. trinn, " +
                            "og ${spotRanges[2].minDegreeYear}. - til ${spotRanges[2].maxDegreeYear}. trinn."
                    else ->
                        desc = ""
                }
            }

            return RegistrationResponseJson(
                res,
                "Du kan dessverre ikke melde deg på.",
                desc
            )
        }
        RegistrationResponse.OK ->
            return RegistrationResponseJson(
                res,
                "Påmeldingen din er registrert!",
                "Du har fått plass på arrangementet."
            )
    }
}
