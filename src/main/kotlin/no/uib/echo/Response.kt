package no.uib.echo

data class ResponseJson(val code: Response, val msg: String, val status: String)

enum class Response {
    InvalidEmail,
    InvalidDegreeYear,
    DegreeMismatchBachelor,
    DegreeMismatchMaster,
    DegreeMismatchKogni,
    DegreeMismatchArmninf,
    InvalidTerms,
    AlreadySubmitted,
    OK,
    Error
}

private fun resToMsg(res: Response): String {
    when (res) {
        Response.InvalidEmail ->
            return "Vennligst skriv inn en gyldig mail."
        Response.InvalidDegreeYear ->
            return "Vennligst velgt et gyldig trinn."
        Response.DegreeMismatchBachelor ->
            return "Studieretning og årstrinn stemmer ikke overens."
        Response.DegreeMismatchMaster ->
            return "Studieretning og årstrinn stemmer ikke overens."
        Response.DegreeMismatchKogni ->
            return "Studieretning og årstrinn stemmer ikke overens."
        Response.DegreeMismatchArmninf ->
            return "Studieretning og årstrinn stemmer ikke overens."
        Response.InvalidTerms ->
            return "Du må godkjenne Bedkom sine retningslinjer."
        Response.AlreadySubmitted ->
            return "Du kan ikke melde deg på flere ganger."
        Response.OK ->
            return "Påmeldingen din er registrert!"
        Response.Error ->
            return "Det har skjedd en feil."
    }
}

fun resToStatus(res: Response): String {
    when (res) {
        Response.OK ->
            return "success"
        Response.Error ->
            return "error"
        else ->
            return "warning"
    }
}

fun resToJson(res: Response): ResponseJson {
    return ResponseJson(res, resToMsg(res), resToStatus(res))
}