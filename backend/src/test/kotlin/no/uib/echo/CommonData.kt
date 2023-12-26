package no.uib.echo

import no.uib.echo.schema.AnswerJson
import no.uib.echo.schema.Degree
import no.uib.echo.schema.FormDeregistrationJson
import no.uib.echo.schema.FormRegistrationJson
import no.uib.echo.schema.HAPPENING_TYPE
import no.uib.echo.schema.HappeningJson
import no.uib.echo.schema.SpotRangeJson
import no.uib.echo.schema.UserJson
import org.joda.time.DateTime

val everyoneSpotRange = listOf(SpotRangeJson(50, 1, 5))
val oneTwoSpotRange = listOf(SpotRangeJson(50, 1, 2))
val threeFiveSpotRange = listOf(SpotRangeJson(50, 3, 5))
val everyoneSplitSpotRange =
    listOf(
        SpotRangeJson(5, 1, 2),
        SpotRangeJson(5, 3, 5),
    )
val everyoneInfiniteSpotRange = listOf(SpotRangeJson(0, 1, 5))
val onlyOneSpotRange = listOf(SpotRangeJson(1, 1, 5))
val fewSpotRange = listOf(SpotRangeJson(5, 1, 5))

val hap1: (type: HAPPENING_TYPE) -> HappeningJson = { type ->
    HappeningJson(
        "$type-med-noen",
        "$type med Noen!",
        "2020-04-29T20:43:29Z",
        "2030-04-29T20:43:29Z",
        everyoneSpotRange,
        type,
        if (type == HAPPENING_TYPE.BEDPRES) "bedkom" else "tilde",
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
        if (type == HAPPENING_TYPE.BEDPRES) "bedkom" else "tilde",
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
        if (type == HAPPENING_TYPE.BEDPRES) "bedkom" else "tilde",
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
        if (type == HAPPENING_TYPE.BEDPRES) "bedkom" else "tilde",
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
        if (type == HAPPENING_TYPE.BEDPRES) "bedkom" else "tilde",
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
        if (type == HAPPENING_TYPE.BEDPRES) "bedkom" else "tilde",
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
        if (type == HAPPENING_TYPE.BEDPRES) "bedkom" else "tilde",
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
        if (type == HAPPENING_TYPE.BEDPRES) "bedkom" else "tilde",
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
        if (type == HAPPENING_TYPE.BEDPRES) "bedkom" else "tilde",
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
        if (type == HAPPENING_TYPE.BEDPRES) "bedkom" else "tilde",
    )
}

val haps: (type: HAPPENING_TYPE) -> List<HappeningJson> = { t ->
    listOf(hap1(t), hap2(t), hap3(t), hap4(t), hap5(t), hap6(t), hap7(t), hap8(t), hap9(t), hap10(t))
}

val exReg: (slug: String, user: UserJson) -> FormRegistrationJson = { slug, user ->
    FormRegistrationJson(
        user.email,
        slug,
        listOf(
            AnswerJson("Skal du ha mat?", "Nei"),
            AnswerJson("Har du noen allergier?", "Ja masse allergier ass 100"),
        ),
    )
}

val deReg: (slug: String, user: UserJson) -> FormDeregistrationJson = { slug, user ->
    FormDeregistrationJson(
        user.email,
        slug,
        "",
    )
}

val user1 =
    UserJson(
        "bast1@student.uib.no",
        "Bachelor Student #1",
        "bachelor.student1@gmail.com",
        2,
        Degree.DSIK,
        listOf("tilde"),
        0,
        DateTime.now().toString(),
        DateTime.now().toString(),
    )
val user2 =
    UserJson(
        "bast2@student.uib.no",
        "Bachelor Student #2",
        "bachelor.student2@gmail.com",
        3,
        Degree.DTEK,
        listOf("webkom"),
        0,
        DateTime.now().toString(),
        DateTime.now().toString(),
    )
val user3 =
    UserJson(
        "bast3@student.uib.no",
        "Bachelor Student #3",
        null,
        1,
        Degree.DVIT,
        listOf("bedkom", "tilde"),
        0,
        DateTime.now().toString(),
        DateTime.now().toString(),
    )
val user4 =
    UserJson(
        "bast4@student.uib.no",
        "Bachelor Student #4",
        "bachelor.student4@gmail.com",
        2,
        Degree.BINF,
        strikes = 4,
        createdAt = DateTime.now().toString(),
        modifiedAt = DateTime.now().toString(),
    )
val user5 =
    UserJson(
        "bast5@student.uib.no",
        "Bachelor Student #5",
        "bachelor.student5@gmail.com",
        3,
        Degree.IMO,
        strikes = 2,
        createdAt = DateTime.now().toString(),
        modifiedAt = DateTime.now().toString(),
    )

val user6 =
    UserJson(
        "mast1@student.uib.no",
        "Master Student #1",
        "master.student1@gmail.com",
        4,
        Degree.INF,
        strikes = 2,
        createdAt = DateTime.now().toString(),
        modifiedAt = DateTime.now().toString(),
    )
val user7 =
    UserJson(
        "mast2@student.uib.no",
        "Master Student #2",
        null,
        5,
        Degree.PROG,
        strikes = 2,
        createdAt = DateTime.now().toString(),
        modifiedAt = DateTime.now().toString(),
    )
val user8 =
    UserJson(
        "mast3@student.uib.no",
        "Master Student #3",
        "master.student3@gmail.com",
        5,
        Degree.INF,
        strikes = 2,
        createdAt = DateTime.now().toString(),
        modifiedAt = DateTime.now().toString(),
    )

val user9 =
    UserJson(
        "post@student.uib.no",
        "Post Student",
        "post.student@gmail.com",
        3,
        Degree.POST,
        strikes = 2,
        createdAt = DateTime.now().toString(),
        modifiedAt = DateTime.now().toString(),
    )
val user10 =
    UserJson(
        "arinf@student.uib.no",
        "Årinf Student",
        "arinf.student@gmail.com",
        1,
        Degree.ARMNINF,
        strikes = 2,
        createdAt = DateTime.now().toString(),
        modifiedAt = DateTime.now().toString(),
    )

val adminUser =
    UserJson(
        "admin@student.uib.no",
        "Admin Dude",
        "admin@gmail.com",
        5,
        Degree.INF,
        listOf("webkom"),
        0,
        DateTime.now().toString(),
        DateTime.now().toString(),
    )

val users = listOf(user1, user2, user3, user4, user5, user6, user7, user8, user9, user10)
val usersWithAdmin = users.plus(listOf(adminUser))

val be = listOf(HAPPENING_TYPE.BEDPRES, HAPPENING_TYPE.EVENT)
