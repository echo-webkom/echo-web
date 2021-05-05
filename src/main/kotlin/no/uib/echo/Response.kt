package no.uib.echo

data class ResponseJson(val code: Response, val msg: String)

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
}

private fun resToMsg(res: Response): String {
    when (res) {
        Response.InvalidEmail ->
            return "Vennligst skriv inn en gyldig mail."
        Response.InvalidDegreeYear ->
            return "Vennligst velgt et gyldig trinn."
        Response.InvalidTerms ->
            return "Du må godkjenne Bedkom sine retningslinjer."
        Response.AlreadySubmitted ->
            return "Du kan ikke melde deg på flere ganger."
        Response.OK ->
            return "Påmeldingen din er registrert!"
        else ->
            return "Studieretning og årstrinn stemmer ikke overens."
    }
}

fun resToJson(res: Response): ResponseJson {
    return ResponseJson(res, resToMsg(res))
}