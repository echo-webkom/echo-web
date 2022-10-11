package no.uib.echo

import no.uib.echo.schema.AnswerJson
import no.uib.echo.schema.Degree
import no.uib.echo.schema.HAPPENING_TYPE
import no.uib.echo.schema.HappeningJson
import no.uib.echo.schema.RegistrationJson
import no.uib.echo.schema.SpotRangeJson

val everyoneSpotRange = listOf(SpotRangeJson(50, 1, 5))
val oneTwoSpotRange = listOf(SpotRangeJson(50, 1, 2))
val threeFiveSpotRange = listOf(SpotRangeJson(50, 3, 5))
val everyoneSplitSpotRange = listOf(
    SpotRangeJson(20, 1, 2), SpotRangeJson(20, 3, 5)
)
val everyoneInfiniteSpotRange = listOf(SpotRangeJson(0, 1, 5))
val onlyOneSpotRange = listOf(SpotRangeJson(1, 1, 5))
val fewSpotRange = listOf(SpotRangeJson(5, 1, 5))

val adminKey = System.getenv("ADMIN_KEY")
val featureToggles =
    FeatureToggles(sendEmailReg = false, rateLimit = false, verifyRegs = false)

val hap1: (type: HAPPENING_TYPE) -> HappeningJson = { type ->
    HappeningJson(
        "$type-med-noen",
        "$type med Noen!",
        "2020-04-29T20:43:29Z",
        "2030-04-29T20:43:29Z",
        everyoneSpotRange,
        type,
        "test@test.com",
        if (type == HAPPENING_TYPE.BEDPRES) "bedkom" else "tilde"
    )
}

val hap2: (type: HAPPENING_TYPE) -> HappeningJson = { type ->
    HappeningJson(
        "$type-med-noen-andre",
        "$type med Noen Andre!",
        "2019-07-29T20:10:11Z",
        "2030-07-29T20:10:11Z",
        everyoneSpotRange,
        type,
        "test@test.com",
        if (type == HAPPENING_TYPE.BEDPRES) "bedkom" else "tilde"
    )
}

val hap3: (type: HAPPENING_TYPE) -> HappeningJson = { type ->
    HappeningJson(
        "$type-dritlang-i-fremtiden",
        "$type dritlangt i fremtiden!!",
        "2037-07-29T20:10:11Z",
        "2038-01-01T20:10:11Z",
        everyoneSpotRange,
        type,
        "test@test.com",
        if (type == HAPPENING_TYPE.BEDPRES) "bedkom" else "tilde"
    )
}

val hap4: (type: HAPPENING_TYPE) -> HappeningJson = { type ->
    HappeningJson(
        "$type-for-bare-1-til-2",
        "$type (for bare 1 til 2)!",
        "2020-05-29T20:00:11Z",
        "2030-05-29T20:00:11Z",
        oneTwoSpotRange,
        type,
        "test@test.com",
        if (type == HAPPENING_TYPE.BEDPRES) "bedkom" else "tilde"
    )
}

val hap5: (type: HAPPENING_TYPE) -> HappeningJson = { type ->
    HappeningJson(
        "$type-for-bare-3-til-5",
        "$type (for bare 3 til 5)!",
        "2020-06-29T18:07:31Z",
        "2030-06-29T18:07:31Z",
        threeFiveSpotRange,
        type,
        "test@test.com",
        if (type == HAPPENING_TYPE.BEDPRES) "bedkom" else "tilde"
    )
}

val hap6: (type: HAPPENING_TYPE) -> HappeningJson = { type ->
    HappeningJson(
        "$type-som-er-splitta-ty-bedkom",
        "$type (som er splitta ty Bedkom)!",
        "2020-06-29T18:07:31Z",
        "2030-06-29T18:07:31Z",
        everyoneSplitSpotRange,
        type,
        "test@test.com",
        if (type == HAPPENING_TYPE.BEDPRES) "bedkom" else "tilde"
    )
}

val hap7: (type: HAPPENING_TYPE) -> HappeningJson = { type ->
    HappeningJson(
        "$type-med-uendelig-plasser",
        "$type med uendelig plasser!",
        "2020-06-29T18:07:31Z",
        "2030-06-29T18:07:31Z",
        everyoneInfiniteSpotRange,
        type,
        "test@test.com",
        if (type == HAPPENING_TYPE.BEDPRES) "bedkom" else "tilde"
    )
}

val hap8: (type: HAPPENING_TYPE) -> HappeningJson = { type ->
    HappeningJson(
        "$type-med-en-plass",
        "$type med én plass!",
        "2020-06-29T18:07:31Z",
        "2030-06-29T18:07:31Z",
        onlyOneSpotRange,
        type,
        "test@test.com",
        if (type == HAPPENING_TYPE.BEDPRES) "bedkom" else "tilde"
    )
}

val hap9: (type: HAPPENING_TYPE) -> HappeningJson = { type ->
    HappeningJson(
        "$type-med-få-plasser",
        "$type med få plasser!",
        "2020-02-18T16:27:05Z",
        "2030-02-18T16:27:05Z",
        fewSpotRange,
        type,
        "test@test.com",
        if (type == HAPPENING_TYPE.BEDPRES) "bedkom" else "tilde"
    )
}

val hap10: (type: HAPPENING_TYPE) -> HappeningJson = { type ->
    HappeningJson(
        "$type-som-har-vært",
        "$type som har vært!",
        "2020-02-14T12:00:00Z",
        "2020-02-28T16:15:00Z",
        fewSpotRange,
        type,
        "test@test.com",
        if (type == HAPPENING_TYPE.BEDPRES) "bedkom" else "tilde"
    )
}

val exReg: (type: HAPPENING_TYPE, slug: String) -> RegistrationJson = { type, slug ->
    RegistrationJson(
        "tEsT1$type@TeSt.com", "Én", "Navnesen", Degree.DTEK, 3, slug, true, null, false,
        listOf(
            AnswerJson("Skal du ha mat?", "Nei"), AnswerJson("Har du noen allergier?", "Ja masse allergier ass 100")
        ),
        type, null
    )
}

val be = listOf(HAPPENING_TYPE.BEDPRES, HAPPENING_TYPE.EVENT)
