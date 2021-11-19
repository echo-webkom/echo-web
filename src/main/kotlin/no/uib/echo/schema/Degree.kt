package no.uib.echo.schema

enum class Degree {
    DTEK,
    DSIK,
    DVIT,
    BINF,
    IMO,
    IKT,
    KOGNI,
    INF,
    PROG,
    ARMNINF,
    POST,
    MISC
}

val bachelors: List<Degree> = listOf(Degree.DTEK, Degree.DSIK, Degree.DVIT, Degree.BINF, Degree.IMO, Degree.IKT)
val masters: List<Degree> = listOf(Degree.INF, Degree.PROG)
