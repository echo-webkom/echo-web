package no.uib.echo.schema

enum class Degree {
    DTEK,
    DSIK,
    DVIT,
    BINF,
    IMO,
    INF,
    PROG,
    ARMNINF,
    POST,
    // MISC should not be used,
    // it is only here for backwards compatibility.
    MISC,
    // IKT and KOGNI should not be used,
    // they are only here for backwards compatibility.
    IKT,
    KOGNI
}

val bachelors: List<Degree> = listOf(Degree.DTEK, Degree.DSIK, Degree.DVIT, Degree.BINF, Degree.IMO)
val masters: List<Degree> = listOf(Degree.INF, Degree.PROG)

fun nullableStringToDegree(str: String?): Degree? {
    return when (str) {
        "DTEK" -> Degree.DTEK
        "DSIK" -> Degree.DSIK
        "BINF" -> Degree.BINF
        "IMO" -> Degree.IMO
        "INF" -> Degree.INF
        "PROG" -> Degree.PROG
        "ARMNINF" -> Degree.ARMNINF
        "POST" -> Degree.POST
        "MISC" -> Degree.MISC
        "IKT" -> Degree.IKT
        "KOGNI" -> Degree.KOGNI
        else -> null
    }
}
