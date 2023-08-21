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
    DSC,

    // MISC, IKT and KOGNI should not be used,
    // they are only here for backwards compatibility.
    MISC,
    IKT,
    KOGNI
}

val bachelors: List<Degree> = listOf(Degree.DTEK, Degree.DSIK, Degree.DVIT, Degree.BINF, Degree.IMO, Degree.DSC)
val masters: List<Degree> = listOf(Degree.INF, Degree.PROG, Degree.DSC)

fun nullableStringToDegree(str: String?): Degree? {
    return when (str) {
        "DTEK" -> Degree.DTEK
        "DSIK" -> Degree.DSIK
        "DVIT" -> Degree.DVIT
        "BINF" -> Degree.BINF
        "IMO" -> Degree.IMO
        "INF" -> Degree.INF
        "PROG" -> Degree.PROG
        "ARMNINF" -> Degree.ARMNINF
        "POST" -> Degree.POST
        "DSC" -> Degree.DSC
        // MISC, IKT and KOGNI should not be used,
        // they are only here for backwards compatibility.
        "MISC" -> Degree.MISC
        "IKT" -> Degree.IKT
        "KOGNI" -> Degree.KOGNI
        else -> null
    }
}

fun nullableDegreeToString(deg: Degree?): String? {
    return when (deg) {
        Degree.DTEK -> "DTEK"
        Degree.DSIK -> "DSIK"
        Degree.DVIT -> "DVIT"
        Degree.BINF -> "BINF"
        Degree.IMO -> "IMO"
        Degree.INF -> "INF"
        Degree.PROG -> "PROG"
        Degree.ARMNINF -> "ARMNINF"
        Degree.POST -> "POST"
        Degree.DSC -> "DSC"
        // MISC, IKT and KOGNI should not be used,
        // they are only here for backwards compatibility.
        Degree.MISC -> "MISC"
        Degree.IKT -> "IKT"
        Degree.KOGNI -> "KOGNI"
        else -> null
    }
}
