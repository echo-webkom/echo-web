package no.uib.echo

import kotlinx.serialization.Serializable
import no.uib.echo.schema.HAPPENING_TYPE
import no.uib.echo.schema.SpotRangeJson

@Serializable
data class RegistrationResponseJson(
    val code: RegistrationResponse,
    val title: String,
    val desc: String,
    val date: String? = null
)

@Serializable
enum class RegistrationResponse {
    InvalidEmail,
    InvalidDegreeYear,
    InvalidTerms,
    DegreeMismatchBachelor,
    DegreeMismatchMaster,
    DegreeMismatchArmninf,
    AlreadySubmitted,
    AlreadySubmittedWaitList,
    HappeningDoesntExist,
    NotViaForm,
    TooEarly,
    TooLate,
    WaitList,
    NotInRange,
    OK,
}

fun resToJson(
    res: RegistrationResponse,
    regType: HAPPENING_TYPE,
    regDate: String? = null,
    spotRanges: List<SpotRangeJson>? = null,
    waitListSpot: Long? = null
): RegistrationResponseJson {
    val defaultDesc = "Vennligst prøv igjen."

    when (res) {
        RegistrationResponse.InvalidEmail ->
            return RegistrationResponseJson(res, "Vennligst skriv inn en gyldig mail.", "", regDate)
        RegistrationResponse.InvalidDegreeYear ->
            return RegistrationResponseJson(res, "Vennligst velgt et gyldig trinn.", "", regDate)
        RegistrationResponse.InvalidTerms ->
            return RegistrationResponseJson(
                res,
                if (regType == HAPPENING_TYPE.BEDPRES) "Du må godkjenne Bedkom sine retningslinjer." else "Du må godkjenne vilkårene.",
                defaultDesc,
                regDate
            )
        RegistrationResponse.DegreeMismatchBachelor, RegistrationResponse.DegreeMismatchMaster, RegistrationResponse.DegreeMismatchArmninf ->
            return RegistrationResponseJson(res, "Studieretning og årstrinn stemmer ikke overens.", defaultDesc, regDate)
        RegistrationResponse.AlreadySubmitted ->
            return RegistrationResponseJson(res, "Du er allerede påmeldt.", "Du har allerede fått plass.", regDate)
        RegistrationResponse.AlreadySubmittedWaitList ->
            return RegistrationResponseJson(res, "Du er allerede påmeldt.", "Du er på ventelisten.", regDate)
        RegistrationResponse.NotViaForm ->
            return RegistrationResponseJson(
                res,
                "Du må melde deg på via nettsiden.",
                "Det ser ut som du prøve å melde deg på utenfor nettsiden. Om du mener dette ikke stemmer, ta kontakt med Webkom.",
                regDate
            )
        RegistrationResponse.TooEarly ->
            return RegistrationResponseJson(res, "Påmeldingen er ikke åpen enda.", "Vennligst vent.", regDate)
        RegistrationResponse.TooLate ->
            return RegistrationResponseJson(
                res,
                "Påmeldingen er stengt.",
                "Det er ikke mulig å melde seg på lenger.",
                regDate
            )
        RegistrationResponse.WaitList -> {
            val desc = when (waitListSpot) {
                null -> "Du har blitt satt på ventelisten, og vil bli kontaktet om det åpner seg en ledig plass."
                else -> "Du er på plass nr. $waitListSpot på ventelisten, og vil bli kontaktet om det åpner seg en ledig plass."
            }
            return RegistrationResponseJson(
                res,
                "Alle plassene er dessverre fylt opp.",
                desc,
                regDate
            )
        }
        RegistrationResponse.HappeningDoesntExist ->
            return RegistrationResponseJson(
                res,
                if (regType == HAPPENING_TYPE.BEDPRES) "Denne bedriftspresentasjonen finnes ikke." else "Dette arrangementet finnes ikke.",
                "Om du mener dette ikke stemmer, ta kontakt med Webkom.",
                regDate
            )
        RegistrationResponse.NotInRange -> {
            val str = when (regType) {
                HAPPENING_TYPE.BEDPRES ->
                    "Denne bedriftspresentasjonen er kun åpen for "
                HAPPENING_TYPE.EVENT ->
                    "Dette arrangementet er kun åpent for "
            }

            var desc = str
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
                desc,
                regDate
            )
        }
        RegistrationResponse.OK ->
            return RegistrationResponseJson(
                res,
                "Påmeldingen din er registrert!",
                if (regType == HAPPENING_TYPE.BEDPRES) "Du har fått plass på bedriftspresentasjonen." else "Du har fått plass på arrangementet.",
                regDate
            )
    }
}
