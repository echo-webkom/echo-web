package no.uib.echo

import kotlinx.serialization.Serializable
import no.uib.echo.schema.HAPPENING_TYPE
import no.uib.echo.schema.SpotRangeJson

@Serializable
data class ResponseJson(val code: Response, val title: String, val desc: String, val date: String? = null)

enum class Response {
    InvalidEmail,
    InvalidDegreeYear,
    InvalidTerms,
    DegreeMismatchBachelor,
    DegreeMismatchMaster,
    DegreeMismatchKogni,
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
    res: Response,
    regType: HAPPENING_TYPE,
    regDate: String? = null,
    spotRanges: List<SpotRangeJson>? = null,
    waitListSpot: Long? = null
): ResponseJson {
    val defaultDesc = "Vennligst prøv igjen."

    when (res) {
        Response.InvalidEmail ->
            return ResponseJson(res, "Vennligst skriv inn en gyldig mail.", "", regDate)
        Response.InvalidDegreeYear ->
            return ResponseJson(res, "Vennligst velgt et gyldig trinn.", "", regDate)
        Response.InvalidTerms ->
            return ResponseJson(
                res,
                if (regType == HAPPENING_TYPE.BEDPRES) "Du må godkjenne Bedkom sine retningslinjer." else "Du må godkjenne vilkårene.",
                defaultDesc,
                regDate
            )
        Response.DegreeMismatchBachelor, Response.DegreeMismatchMaster, Response.DegreeMismatchKogni, Response.DegreeMismatchArmninf ->
            return ResponseJson(res, "Studieretning og årstrinn stemmer ikke overens.", defaultDesc, regDate)
        Response.AlreadySubmitted ->
            return ResponseJson(res, "Du er allerede påmeldt.", "Du har allerede fått plass.", regDate)
        Response.AlreadySubmittedWaitList ->
            return ResponseJson(res, "Du er allerede påmeldt.", "Du er på ventelisten.", regDate)
        Response.NotViaForm ->
            return ResponseJson(
                res,
                "Du må melde deg på via nettsiden.",
                "Det ser ut som du prøve å melde deg på utenfor nettsiden. Om du mener dette ikke stemmer, ta kontakt med Webkom.",
                regDate
            )
        Response.TooEarly ->
            return ResponseJson(res, "Påmeldingen er ikke åpen enda.", "Vennligst vent.", regDate)
        Response.TooLate ->
            return ResponseJson(res, "Påmeldingen er stengt.", "Det er ikke mulig å melde seg på lenger.", regDate)
        Response.WaitList -> {
            val desc = when (waitListSpot) {
                null -> "Du har blitt satt på ventelisten, og vil bli kontaktet om det åpner seg en ledig plass."
                else -> "Du er på plass nr. $waitListSpot på ventelisten, og vil bli kontaktet om det åpner seg en ledig plass."
            }
            return ResponseJson(
                res,
                "Alle plassene er dessverre fylt opp.",
                desc,
                regDate
            )
        }
        Response.HappeningDoesntExist ->
            return ResponseJson(
                res,
                if (regType == HAPPENING_TYPE.BEDPRES) "Denne bedriftspresentasjonen finnes ikke." else "Dette arrangementet finnes ikke.",
                "Om du mener dette ikke stemmer, ta kontakt med Webkom.",
                regDate
            )
        Response.NotInRange -> {
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

            return ResponseJson(
                res,
                "Du kan dessverre ikke melde deg på.",
                desc,
                regDate
            )
        }
        Response.OK ->
            return ResponseJson(
                res,
                "Påmeldingen din er registrert!",
                if (regType == HAPPENING_TYPE.BEDPRES) "Du har fått plass på bedriftspresentasjonen." else "Du har fått plass på arrangementet.",
                regDate
            )
    }
}
