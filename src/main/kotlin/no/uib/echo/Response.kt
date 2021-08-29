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
    BedpresDosntExist,
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
            if (regType == HAPPENINGTYPE.BEDPRES)
                return Pair("Du må godkjenne Bedkom sine retningslinjer.", defaultDesc)
            else
                return Pair("Du må godkjenne noe greier", defaultDesc)
        Response.DegreeMismatchBachelor, Response.DegreeMismatchMaster, Response.DegreeMismatchKogni, Response.DegreeMismatchArmninf ->
            return Pair("Studieretning og årstrinn stemmer ikke overens.", defaultDesc)
        Response.AlreadySubmitted ->
            return Pair("Du er allerede påmeldt.", "Du kan ikke melde deg på flere ganger.")
        Response.TooEarly ->
            return Pair("Påmeldingen er ikke åpen enda.", "Vennligst vent.")
        Response.WaitList ->
            return Pair("Plassene er dessverre fylt opp...", "Du har blitt satt på venteliste.")
        Response.BedpresDosntExist ->
            return if (regType == HAPPENINGTYPE.BEDPRES)
                Pair("Denne bedpres'en finnes ikke.", "Om du mener dette ikke stemmer, ta kontakt med Webkom.")
            else
                Pair("Dette arrangementet finnes ikke.", "Om du mener dette ikke stemmer, ta kontakt med Webkom.")
        Response.NotInRange ->
            return Pair("Du kan dessverre ikke melde deg på.", "")
        Response.OK ->
            return Pair("Påmeldingen din er registrert!", "")
    }
}

fun resToJson(
    res: Response,
    regType: HAPPENINGTYPE,
    date: String? = null,
    degreeYearRange: IntRange? = null
): ResponseJson {
    val (title, desc) = resToMsg(res, regType)
    return if (degreeYearRange == null)
        ResponseJson(res, title, desc, date)
    else
        ResponseJson(
            res,
            title,
            "Denne bedpres'en er kun åpen for ${degreeYearRange.start}- til ${degreeYearRange.last}-klasse.",
            date
        )
}
