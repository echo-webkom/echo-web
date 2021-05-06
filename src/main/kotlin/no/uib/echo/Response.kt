package no.uib.echo

data class ResponseJson(val code: Response, val msg: String, val date: String?)

enum class Response {
    InvalidEmail,
    InvalidDegreeYear,
    InvalidTerms,
    DegreeMismatchBachelor,
    DegreeMismatchMaster,
    DegreeMismatchKogni,
    DegreeMismatchArmninf,
    AlreadySubmitted,
    TooEarly,
    WaitList,
    OK,
}

private fun resToMsg(res: Response): String {
    when (res) {
        Response.InvalidEmail ->
            return "Vennligst skriv inn en gyldig mail."
        Response.InvalidDegreeYear ->
            return "Vennligst velgt et gyldig trinn."
        Response.InvalidTerms ->
            return "Du må godkjenne Bedkom sine retningslinjer."
        Response.DegreeMismatchBachelor, Response.DegreeMismatchMaster, Response.DegreeMismatchKogni, Response.DegreeMismatchArmninf ->
            return "Studieretning og årstrinn stemmer ikke overens."
        Response.AlreadySubmitted ->
            return "Du kan ikke melde deg på flere ganger."
        Response.TooEarly ->
            return "Påmeldingen er ikke åpen enda."
        Response.WaitList ->
            return "Plassene er fylt opp, men du har blitt satt på venteliste."
        Response.OK ->
            return "Påmeldingen din er registrert!"
    }
}

fun resToJson(res: Response, date: String? = null): ResponseJson {
    return ResponseJson(res, resToMsg(res), date)
}