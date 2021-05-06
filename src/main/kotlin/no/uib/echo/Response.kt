package no.uib.echo

import org.joda.time.DateTime

data class ResponseJson(val code: Response, val msg: String, val date: String?)

enum class Response {
    InvalidEmail,
    InvalidDegreeYear,
    DegreeMismatchBachelor,
    DegreeMismatchMaster,
    DegreeMismatchKogni,
    DegreeMismatchArmninf,
    InvalidTerms,
    AlreadySubmitted,
    TooEarly,
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
        Response.TooEarly ->
            return "Påmeldingen er ikke åpen enda."
        Response.OK ->
            return "Påmeldingen din er registrert!"
        else ->
            return "Studieretning og årstrinn stemmer ikke overens."
    }
}

fun resToJson(res: Response, date: DateTime? = null): ResponseJson {
    return ResponseJson(res, resToMsg(res), date.toString())
}