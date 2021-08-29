package no.uib.echo

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

private fun resToMsg(res: Response): Pair<String, String> {
    val defaultDesc = "Vennligst prøv igjen."

    when (res) {
        Response.InvalidEmail ->
            return Pair("Vennligst skriv inn en gyldig mail.", "")
        Response.InvalidDegreeYear ->
            return Pair("Vennligst velgt et gyldig trinn.", "")
        Response.InvalidTerms ->
            return Pair("Du må godkjenne Bedkom sine retningslinjer.", defaultDesc)
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
        Response.BedpresDosntExist ->
            return Pair(
                "Denne bedriftspresentasjonen finnes ikke.",
                "Om du mener dette ikke stemmer, ta kontakt med Webkom."
            )
        Response.NotInRange ->
            return Pair("Du kan dessverre ikke melde deg på.", "")
        Response.OK ->
            return Pair("Påmeldingen din er registrert!", "Du har fått plass på bedriftspresentasjonen.")
    }
}

fun resToJson(res: Response, date: String? = null, degreeYearRange: IntRange? = null): ResponseJson {
    val (title, desc) = resToMsg(res)
    return if (degreeYearRange == null)
        ResponseJson(res, title, desc, date)
    else
        ResponseJson(
            res,
            title,
            "Denne bedriftspresentasjonen er kun åpen for ${degreeYearRange.start}- til ${degreeYearRange.last}-klasse.",
            date
        )
}
