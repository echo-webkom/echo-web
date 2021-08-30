package no.uib.echo

import no.uib.echo.schema.HAPPENINGTYPE

data class ResponseJson(val code: Response, val title: String, val desc: String, val date: String?)

enum class Response {
    InvalidEmail,
    InvalidDegreeYear,
    InvalidTerms,
    DegreeMismatchBachelor,
    DegreeMismatchMaster,
    DegreeMismatchKogni,
    DegreeMismatchArmninf,
    AlreadySubmitted,
    HappeningDoesntExist,
    TooEarly,
    WaitList,
    NotInRange,
    OK,
}

private fun resToMsg(res: Response, regType: HAPPENINGTYPE): Pair<String, String> {
    val defaultDesc = "Vennligst prøv igjen."

    when (res) {
        Response.InvalidEmail ->
            return Pair("Vennligst skriv inn en gyldig mail.", "")
        Response.InvalidDegreeYear ->
            return Pair("Vennligst velgt et gyldig trinn.", "")
        Response.InvalidTerms ->
            return Pair(
                if (regType == HAPPENINGTYPE.BEDPRES) "Du må godkjenne Bedkom sine retningslinjer." else "Du må godkjenne vilkårene.",
                defaultDesc
            )
        Response.DegreeMismatchBachelor, Response.DegreeMismatchMaster, Response.DegreeMismatchKogni, Response.DegreeMismatchArmninf ->
            return Pair("Studieretning og årstrinn stemmer ikke overens.", defaultDesc)
        Response.AlreadySubmitted ->
            return Pair("Du er allerede påmeldt.", "Du kan ikke melde deg på flere ganger.")
        Response.TooEarly ->
            return Pair("Påmeldingen er ikke åpen enda.", "Vennligst vent.")
        Response.WaitList ->
            return Pair(
                "Alle plassene er dessverre fylt opp...",
                "Du har blitt satt på venteliste, og vil bli kontaktet om det åpner seg en ledig plass."
            )
        Response.HappeningDoesntExist ->
            return Pair(
                if (regType == HAPPENINGTYPE.BEDPRES) "Denne bedriftspresentasjonen finnes ikke." else "Dette arrangementet finnes ikke.",
                "Om du mener dette ikke stemmer, ta kontakt med Webkom."
            )
        Response.NotInRange ->
            return Pair("Du kan dessverre ikke melde deg på.", "")
        Response.OK ->
            return Pair(
                "Påmeldingen din er registrert!",
                if (regType == HAPPENINGTYPE.BEDPRES) "Du har fått plass på bedriftspresentasjonen." else "Du har fått plass på arrangementet."
            )

    }
}

fun resToJson(
    res: Response,
    regType: HAPPENINGTYPE,
    date: String? = null,
    degreeYearRange: IntRange? = null
): ResponseJson {
    val (title, desc) = resToMsg(res, regType)

    if (degreeYearRange == null)
        return ResponseJson(res, title, desc, date)
    else {
        val str = when (regType) {
            HAPPENINGTYPE.BEDPRES ->
                "Denne bedriftspresentasjonen er kun åpen"
            HAPPENINGTYPE.EVENT ->
                "Dette arrangementet er kun åpent"
        }
        return ResponseJson(
            res,
            title,
            "$str for ${degreeYearRange.start}- til ${degreeYearRange.last}-klasse.",
            date
        )
    }
}
