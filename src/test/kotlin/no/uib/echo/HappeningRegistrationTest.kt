package no.uib.echo

import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.ktor.http.HttpHeaders
import io.ktor.http.HttpMethod
import io.ktor.http.HttpStatusCode
import io.ktor.server.testing.TestApplicationCall
import io.ktor.server.testing.handleRequest
import io.ktor.server.testing.setBody
import io.ktor.server.testing.withTestApplication
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import no.uib.echo.plugins.Routing
import no.uib.echo.plugins.configureRouting
import no.uib.echo.schema.Answer
import no.uib.echo.schema.AnswerJson
import no.uib.echo.schema.Degree
import no.uib.echo.schema.HAPPENING_TYPE
import no.uib.echo.schema.Happening
import no.uib.echo.schema.HappeningInfoJson
import no.uib.echo.schema.HappeningJson
import no.uib.echo.schema.HappeningResponseJson
import no.uib.echo.schema.Registration
import no.uib.echo.schema.RegistrationJson
import no.uib.echo.schema.SpotRange
import no.uib.echo.schema.SpotRangeJson
import no.uib.echo.schema.bachelors
import no.uib.echo.schema.insertOrUpdateHappening
import no.uib.echo.schema.masters
import no.uib.echo.schema.toCsv
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction
import java.net.URI
import java.util.Base64

class HappeningRegistrationTest : StringSpec({
    val everyoneSpotRange = listOf(SpotRangeJson(50, 1, 5))
    val oneTwoSpotRange = listOf(SpotRangeJson(50, 1, 2))
    val threeFiveSpotRange = listOf(SpotRangeJson(50, 3, 5))
    val everyoneSplitSpotRange = listOf(
        SpotRangeJson(20, 1, 2),
        SpotRangeJson(20, 3, 5)
    )
    val everyoneInfiniteSpotRange = listOf(SpotRangeJson(0, 1, 5))
    val onlyOneSpotRange = listOf(SpotRangeJson(1, 1, 5))
    val fewSpotRange = listOf(SpotRangeJson(5, 1, 5))

    val exampleHappening1: (type: HAPPENING_TYPE) -> HappeningJson =
        { type ->
            HappeningJson(
                "$type-med-noen",
                "$type med Noen!",
                "2020-04-29T20:43:29Z",
                "2030-04-29T20:43:29Z",
                everyoneSpotRange,
                type,
                "test@test.com"
            )
        }
    val exampleHappening2: (type: HAPPENING_TYPE) -> HappeningJson =
        { type ->
            HappeningJson(
                "$type-med-noen-andre",
                "$type med Noen Andre!",
                "2019-07-29T20:10:11Z",
                "2030-07-29T20:10:11Z",
                everyoneSpotRange,
                type,
                "test@test.com"
            )
        }
    val exampleHappening3: (type: HAPPENING_TYPE) -> HappeningJson =
        { type ->
            HappeningJson(
                "$type-dritlang-i-fremtiden",
                "$type dritlangt i fremtiden!!",
                "2037-07-29T20:10:11Z",
                "2038-01-01T20:10:11Z",
                everyoneSpotRange,
                type,
                "test@test.com"
            )
        }
    val exampleHappening4: (type: HAPPENING_TYPE) -> HappeningJson =
        { type ->
            HappeningJson(
                "$type-for-bare-1-til-2",
                "$type (for bare 1 til 2)!",
                "2020-05-29T20:00:11Z",
                "2030-05-29T20:00:11Z",
                oneTwoSpotRange,
                type,
                "test@test.com"
            )
        }
    val exampleHappening5: (type: HAPPENING_TYPE) -> HappeningJson =
        { type ->
            HappeningJson(
                "$type-for-bare-3-til-5",
                "$type (for bare 3 til 5)!",
                "2020-06-29T18:07:31Z",
                "2030-06-29T18:07:31Z",
                threeFiveSpotRange,
                type,
                "test@test.com"
            )
        }
    val exampleHappening6: (type: HAPPENING_TYPE) -> HappeningJson =
        { type ->
            HappeningJson(
                "$type-som-er -splitta-ty-bedkom",
                "$type (som er splitta ty Bedkom)!",
                "2020-06-29T18:07:31Z",
                "2030-06-29T18:07:31Z",
                everyoneSplitSpotRange,
                type,
                "test@test.com"
            )
        }
    val exampleHappening7: (type: HAPPENING_TYPE) -> HappeningJson =
        { type ->
            HappeningJson(
                "$type-med-uendelig-plasser",
                "$type med uendelig plasser!",
                "2020-06-29T18:07:31Z",
                "2030-06-29T18:07:31Z",
                everyoneInfiniteSpotRange,
                type,
                "test@test.com"
            )
        }
    val exampleHappening8: (type: HAPPENING_TYPE) -> HappeningJson =
        { type ->
            HappeningJson(
                "$type-med-en-plass",
                "$type med én plass!",
                "2020-06-29T18:07:31Z",
                "2030-06-29T18:07:31Z",
                onlyOneSpotRange,
                type,
                "test@test.com"
            )
        }
    val exampleHappening9: (type: HAPPENING_TYPE) -> HappeningJson =
        { type ->
            HappeningJson(
                "$type-med-få-plasser",
                "$type med få plasser!",
                "2020-02-18T16:27:05Z",
                "2030-02-18T16:27:05Z",
                fewSpotRange,
                type,
                "test@test.com"
            )
        }
    val exampleHappening10: (type: HAPPENING_TYPE) -> HappeningJson =
        { type ->
            HappeningJson(
                "$type-som-har-vært",
                "$type som har vært!",
                "2020-02-14T12:00:00Z",
                "2020-02-28T16:15:00Z",
                fewSpotRange,
                type,
                "test@test.com"
            )
        }
    val exampleHappeningReg: (type: HAPPENING_TYPE) -> RegistrationJson =
        { type ->
            RegistrationJson(
                "tEsT1$type@TeSt.com",
                "Én",
                "Navnesen",
                Degree.DTEK,
                3,
                exampleHappening1(type).slug,
                true,
                null,
                false,
                listOf(
                    AnswerJson("Skal du ha mat?", "Nei"),
                    AnswerJson("Har du noen allergier?", "Ja masse allergier ass 100")
                ),
                type,
                null
            )
        }

    val be = listOf(HAPPENING_TYPE.BEDPRES, HAPPENING_TYPE.EVENT)
    val adminKey = "admin-passord"
    val featureToggles =
        FeatureToggles(sendEmailReg = false, sendEmailHap = false, rateLimit = false, verifyRegs = false)

    beforeSpec { DatabaseHandler(true, URI(System.getenv("DATABASE_URL")), null).init() }
    beforeTest {
        transaction {
            SchemaUtils.drop(
                Happening,
                Registration,
                Answer,
                SpotRange
            )
            SchemaUtils.create(
                Happening,
                Registration,
                Answer,
                SpotRange
            )
        }
        for (t in be) {
            withContext(Dispatchers.IO) {
                insertOrUpdateHappening(exampleHappening1(t), null, sendEmail = false, dev = true)
                insertOrUpdateHappening(exampleHappening2(t), null, sendEmail = false, dev = true)
                insertOrUpdateHappening(exampleHappening3(t), null, sendEmail = false, dev = true)
                insertOrUpdateHappening(exampleHappening4(t), null, sendEmail = false, dev = true)
                insertOrUpdateHappening(exampleHappening5(t), null, sendEmail = false, dev = true)
                insertOrUpdateHappening(exampleHappening6(t), null, sendEmail = false, dev = true)
                insertOrUpdateHappening(exampleHappening7(t), null, sendEmail = false, dev = true)
                insertOrUpdateHappening(exampleHappening8(t), null, sendEmail = false, dev = true)
                insertOrUpdateHappening(exampleHappening9(t), null, sendEmail = false, dev = true)
                insertOrUpdateHappening(exampleHappening10(t), null, sendEmail = false, dev = true)
            }
        }
    }

    "Registrations with valid data should submit correctly." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            fun submitReg(degree: Degree, degreeYear: Int, type: HAPPENING_TYPE) {
                val submitRegCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(
                            Json.encodeToString(
                                exampleHappeningReg(type).copy(
                                    degree = degree,
                                    degreeYear = degreeYear,
                                    email = "${type}test${degree}$degreeYear@test.com"
                                )
                            )
                        )
                    }

                submitRegCall.response.status() shouldBe HttpStatusCode.OK
                val res = Json.decodeFromString<ResponseJson>(submitRegCall.response.content!!)
                res.code shouldBe Response.OK
                res.title shouldBe "Påmeldingen din er registrert!"
                res.desc shouldBe successfulRegMsg(type)
            }

            for (t in be) {
                for (b in bachelors) {
                    for (y in 1..3) {
                        submitReg(b, y, t)
                    }
                }

                for (m in masters) {
                    for (y in 4..5) {
                        submitReg(m, y, t)
                    }
                }

                submitReg(Degree.KOGNI, 3, t)
                submitReg(Degree.ARMNINF, 1, t)
            }
        }
    }

    "The same user should be able to sign up for two different happenings." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            for (t in be) {
                for (b in listOf(exampleHappening1(t), exampleHappening2(t))) {
                    val submitRegCall: TestApplicationCall =
                        handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                            addHeader(HttpHeaders.ContentType, "application/json")
                            setBody(Json.encodeToString(exampleHappeningReg(t).copy(slug = b.slug)))
                        }

                    submitRegCall.response.status() shouldBe HttpStatusCode.OK
                    val res = Json.decodeFromString<ResponseJson>(submitRegCall.response.content!!)
                    res.code shouldBe Response.OK
                    res.title shouldBe "Påmeldingen din er registrert!"
                    res.desc shouldBe successfulRegMsg(t)
                }
            }
        }
    }

    "Registration with valid data and empty question list should submit correctly." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            for (t in be) {
                val submitRegCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(Json.encodeToString(exampleHappeningReg(t).copy(answers = emptyList())))
                    }

                submitRegCall.response.status() shouldBe HttpStatusCode.OK
                val res = Json.decodeFromString<ResponseJson>(submitRegCall.response.content!!)
                res.code shouldBe Response.OK
                res.title shouldBe "Påmeldingen din er registrert!"
                res.desc shouldBe successfulRegMsg(t)
            }
        }
    }

    "You should not be able to sign up for a happening more than once." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            for (t in be) {
                val submitRegCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(Json.encodeToString(exampleHappeningReg(t)))
                    }

                submitRegCall.response.status() shouldBe HttpStatusCode.OK
                val res = Json.decodeFromString<ResponseJson>(submitRegCall.response.content!!)
                res.code shouldBe Response.OK
                res.title shouldBe "Påmeldingen din er registrert!"
                res.desc shouldBe successfulRegMsg(t)

                val submitRegAgainCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(Json.encodeToString(exampleHappeningReg(t)))
                    }

                submitRegAgainCall.response.status() shouldBe HttpStatusCode.UnprocessableEntity
                val resAgain = Json.decodeFromString<ResponseJson>(submitRegAgainCall.response.content!!)
                val code = Response.AlreadySubmitted
                val (_, title, desc) = resToJson(code, t)

                resAgain.code shouldBe code
                resAgain.title shouldBe title
                resAgain.desc shouldBe desc
            }
        }
    }

    "You should not be able to sign up for a happening more than once (wait list)." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            for (t in be) {
                val fillUpRegsCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(Json.encodeToString(exampleHappeningReg(t).copy(slug = exampleHappening8(t).slug)))
                    }

                fillUpRegsCall.response.status() shouldBe HttpStatusCode.OK
                val fillUpRes = Json.decodeFromString<ResponseJson>(fillUpRegsCall.response.content!!)
                val codeFillUp = Response.OK
                val (_, titleFillUp, descFillUp) = resToJson(codeFillUp, t)

                fillUpRes.code shouldBe codeFillUp
                fillUpRes.title shouldBe titleFillUp
                fillUpRes.desc shouldBe descFillUp

                val newEmail = "bruh@moment.com"
                val submitRegCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(
                            Json.encodeToString(
                                exampleHappeningReg(t).copy(
                                    slug = exampleHappening8(t).slug,
                                    email = newEmail
                                )
                            )
                        )
                    }

                submitRegCall.response.status() shouldBe HttpStatusCode.Accepted
                val res = Json.decodeFromString<ResponseJson>(submitRegCall.response.content!!)
                val code = Response.WaitList
                val (_, title, desc) = resToJson(code, t, waitListSpot = 1)

                res.code shouldBe code
                res.title shouldBe title
                res.desc shouldBe desc

                val submitRegAgainCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(
                            Json.encodeToString(
                                exampleHappeningReg(t).copy(
                                    slug = exampleHappening8(t).slug,
                                    email = newEmail
                                )
                            )
                        )
                    }

                submitRegAgainCall.response.status() shouldBe HttpStatusCode.UnprocessableEntity
                val resAgain = Json.decodeFromString<ResponseJson>(submitRegAgainCall.response.content!!)
                val codeAgain = Response.AlreadySubmittedWaitList
                val (_, titleAgain, descAgain) = resToJson(codeAgain, t)

                resAgain.code shouldBe codeAgain
                resAgain.title shouldBe titleAgain
                resAgain.desc shouldBe descAgain
            }
        }
    }

    "You should not be able to sign up for a happening before the registration date." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            for (t in be) {
                val submitRegCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(Json.encodeToString(exampleHappeningReg(t).copy(slug = exampleHappening3(t).slug)))
                    }

                submitRegCall.response.status() shouldBe HttpStatusCode.Forbidden
                val res = Json.decodeFromString<ResponseJson>(submitRegCall.response.content!!)
                res.code shouldBe Response.TooEarly
                res.title shouldBe "Påmeldingen er ikke åpen enda."
                res.desc shouldBe "Vennligst vent."
            }
        }
    }

    "You should not be able to sign up for a happening after the happening date." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            for (t in be) {
                val submitRegCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(Json.encodeToString(exampleHappeningReg(t).copy(slug = exampleHappening10(t).slug)))
                    }

                submitRegCall.response.status() shouldBe HttpStatusCode.Forbidden
                val res = Json.decodeFromString<ResponseJson>(submitRegCall.response.content!!)
                res shouldNotBe null
                val (code, title, desc) = resToJson(res.code, t)

                res.code shouldBe code
                res.title shouldBe title
                res.desc shouldBe desc
            }
        }
    }

    "You should not be able to sign up for a happening that doesn't exist." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            for (t in be) {
                val submitRegCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(Json.encodeToString(exampleHappeningReg(t).copy(slug = "ikke-eksisterende-happening-som-ikke-finnes")))
                    }

                submitRegCall.response.status() shouldBe HttpStatusCode.Conflict
                val res = Json.decodeFromString<ResponseJson>(submitRegCall.response.content!!)
                res.code shouldBe Response.HappeningDoesntExist
                when (t) {
                    HAPPENING_TYPE.BEDPRES ->
                        res.title shouldBe "Denne bedriftspresentasjonen finnes ikke."
                    HAPPENING_TYPE.EVENT ->
                        res.title shouldBe "Dette arrangementet finnes ikke."
                }
                res.desc shouldBe "Om du mener dette ikke stemmer, ta kontakt med Webkom."
            }
        }
    }

    "Email should be valid." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            val emails = listOf(
                Pair("test@test", false),
                Pair("test@test.", false),
                Pair("test@test.", false),
                Pair("test_test.com", false),
                Pair("@test.com", false),
                Pair("test@uib.no", true),
                Pair("test@student.uib.no", true),
                Pair("test_person@hotmail.com", true)
            )

            for (t in be) {
                for ((email, isValid) in emails) {
                    val testCall: TestApplicationCall =
                        handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                            addHeader(HttpHeaders.ContentType, "application/json")
                            setBody(Json.encodeToString(exampleHappeningReg(t).copy(email = email)))
                        }

                    if (isValid)
                        testCall.response.status() shouldBe HttpStatusCode.OK
                    else
                        testCall.response.status() shouldBe HttpStatusCode.BadRequest

                    val res = Json.decodeFromString<ResponseJson>(testCall.response.content!!)
                    res shouldNotBe null

                    if (isValid)
                        res.code shouldBe Response.OK
                    else
                        res.code shouldBe Response.InvalidEmail
                }
            }
        }
    }

    "Degree year should not be smaller than one." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            for (t in be) {
                val testCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        val invalidDegreeYear = exampleHappeningReg(t).copy(degreeYear = 0)
                        setBody(Json.encodeToString(invalidDegreeYear))
                    }

                testCall.response.status() shouldBe HttpStatusCode.BadRequest
                val res = Json.decodeFromString<ResponseJson>(testCall.response.content!!)
                res.code shouldBe Response.InvalidDegreeYear
                res.title shouldBe "Vennligst velgt et gyldig trinn."
                res.desc shouldBe ""
            }
        }
    }

    "Degree year should not be bigger than five." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            for (t in be) {
                val testCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        val invalidDegreeYear = exampleHappeningReg(t).copy(degreeYear = 6)
                        setBody(Json.encodeToString(invalidDegreeYear))
                    }

                testCall.response.status() shouldBe HttpStatusCode.BadRequest
                val res = Json.decodeFromString<ResponseJson>(testCall.response.content!!)
                res.code shouldBe Response.InvalidDegreeYear
                res.title shouldBe "Vennligst velgt et gyldig trinn."
                res.desc shouldBe ""
            }
        }
    }

    "If the degree year is either four or five, the degree should not correspond to a bachelors degree." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            listOf(
                Degree.DTEK,
                Degree.DSIK,
                Degree.DVIT,
                Degree.BINF,
                Degree.IMO,
                Degree.IKT,
            ).map { deg ->
                for (t in be) {
                    for (year in 4..5) {
                        val testCall: TestApplicationCall =
                            handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                                addHeader(HttpHeaders.ContentType, "application/json")
                                val invalidDegreeYear = exampleHappeningReg(t).copy(degreeYear = year, degree = deg)
                                setBody(Json.encodeToString(invalidDegreeYear))
                            }

                        testCall.response.status() shouldBe HttpStatusCode.BadRequest
                        val res = Json.decodeFromString<ResponseJson>(testCall.response.content!!)
                        res.title shouldBe "Studieretning og årstrinn stemmer ikke overens."
                        res.desc shouldBe "Vennligst prøv igjen."
                    }
                }
            }
        }
    }

    "If the degree year is between one and three, the degree should not correspond to a masters degree." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            listOf(Degree.INF, Degree.PROG).map { deg ->
                for (t in be) {
                    for (i in 1..3) {
                        val testCall: TestApplicationCall =
                            handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                                addHeader(HttpHeaders.ContentType, "application/json")
                                val invalidDegreeYear = exampleHappeningReg(t).copy(degreeYear = i, degree = deg)
                                setBody(Json.encodeToString(invalidDegreeYear))
                            }

                        testCall.response.status() shouldBe HttpStatusCode.BadRequest
                        val res = Json.decodeFromString<ResponseJson>(testCall.response.content!!)
                        res.code shouldBe Response.DegreeMismatchMaster
                        res.title shouldBe "Studieretning og årstrinn stemmer ikke overens."
                        res.desc shouldBe "Vennligst prøv igjen."
                    }
                }
            }
        }
    }

    "If degree is KOGNI, degree year should be equal to three." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            for (t in be) {
                val testCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        val invalidDegreeYear = exampleHappeningReg(t).copy(degreeYear = 2, degree = Degree.KOGNI)
                        setBody(Json.encodeToString(invalidDegreeYear))
                    }

                testCall.response.status() shouldBe HttpStatusCode.BadRequest
                val res = Json.decodeFromString<ResponseJson>(testCall.response.content!!)
                res.code shouldBe Response.DegreeMismatchKogni
                res.title shouldBe "Studieretning og årstrinn stemmer ikke overens."
                res.desc shouldBe "Vennligst prøv igjen."
            }
        }
    }

    "If degree is ARMNINF, degree year should be equal to one." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            for (t in be) {
                val testCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        val invalidDegreeYear = exampleHappeningReg(t).copy(degreeYear = 2, degree = Degree.ARMNINF)
                        setBody(Json.encodeToString(invalidDegreeYear))
                    }

                testCall.response.status() shouldBe HttpStatusCode.BadRequest
                val res = Json.decodeFromString<ResponseJson>(testCall.response.content!!)
                res.code shouldBe Response.DegreeMismatchArmninf
                res.title shouldBe "Studieretning og årstrinn stemmer ikke overens."
                res.desc shouldBe "Vennligst prøv igjen."
            }
        }
    }

    "Terms should be accepted." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            for (t in be) {
                val testCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        val invalidTerms = exampleHappeningReg(t).copy(terms = false)
                        setBody(Json.encodeToString(invalidTerms))
                    }

                testCall.response.status() shouldBe HttpStatusCode.BadRequest
                val res = Json.decodeFromString<ResponseJson>(testCall.response.content!!)
                res.code shouldBe Response.InvalidTerms
                when (t) {
                    HAPPENING_TYPE.BEDPRES ->
                        res.title shouldBe "Du må godkjenne Bedkom sine retningslinjer."
                    HAPPENING_TYPE.EVENT ->
                        res.title shouldBe "Du må godkjenne vilkårene."
                }
                res.desc shouldBe "Vennligst prøv igjen."
            }
        }
    }

    "If a happening has filled up every spot, a registration should be put on the wait list." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            for (t in be) {
                for (i in 1..(exampleHappening1(t).spotRanges[0].spots)) {
                    val submitRegCall: TestApplicationCall =
                        handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                            addHeader(HttpHeaders.ContentType, "application/json")
                            setBody(Json.encodeToString(exampleHappeningReg(t).copy(email = "tesadasdt$i@test.com")))
                        }

                    submitRegCall.response.status() shouldBe HttpStatusCode.OK
                    val res = Json.decodeFromString<ResponseJson>(submitRegCall.response.content!!)
                    res.code shouldBe Response.OK
                    res.title shouldBe "Påmeldingen din er registrert!"
                    res.desc shouldBe successfulRegMsg(t)
                }

                for (i in 1..3) {
                    val submitRegWaitlistCall: TestApplicationCall =
                        handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                            addHeader(HttpHeaders.ContentType, "application/json")
                            setBody(Json.encodeToString(exampleHappeningReg(t).copy(email = "takadhasdh$i@test.com")))
                        }

                    submitRegWaitlistCall.response.status() shouldBe HttpStatusCode.Accepted
                    val res = Json.decodeFromString<ResponseJson>(submitRegWaitlistCall.response.content!!)
                    res.code shouldBe Response.WaitList
                    res.title shouldBe "Alle plassene er dessverre fylt opp."
                    res.desc shouldBe "Du er på plass nr. $i på ventelisten, og vil bli kontaktet om det åpner seg en ledig plass."
                }
            }
        }
    }

    "You should not be able to sign up for a happening if you are not inside the degree year range." {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            for (t in be) {
                for (i in 1..2) {
                    val submitRegCall: TestApplicationCall =
                        handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                            addHeader(HttpHeaders.ContentType, "application/json")
                            setBody(
                                Json.encodeToString(
                                    exampleHappeningReg(t).copy(
                                        email = "teasds${i}t3t@test.com",
                                        degreeYear = i,
                                        slug = exampleHappening5(t).slug
                                    )
                                )
                            )
                        }

                    submitRegCall.response.status() shouldBe HttpStatusCode.Forbidden
                    val res = Json.decodeFromString<ResponseJson>(submitRegCall.response.content!!)
                    res.code shouldBe Response.NotInRange
                    val descStart =
                        if (t == HAPPENING_TYPE.BEDPRES) "Denne bedriftspresentasjonen er kun åpen" else "Dette arrangementet er kun åpent"
                    res.desc shouldBe "$descStart for ${exampleHappening5(t).spotRanges[0].minDegreeYear}. til ${
                    exampleHappening5(
                        t
                    ).spotRanges[0].maxDegreeYear
                    }. trinn."
                }

                for (i in 3..5) {
                    val submitRegCall: TestApplicationCall =
                        handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                            addHeader(HttpHeaders.ContentType, "application/json")
                            setBody(
                                Json.encodeToString(
                                    exampleHappeningReg(t).copy(
                                        email = "tlsbreh100aasdlo0${i}t3t@test.com",
                                        degreeYear = i,
                                        degree = if (i > 3) Degree.INF else Degree.DTEK,
                                        slug = exampleHappening4(t).slug
                                    )
                                )
                            )
                        }

                    submitRegCall.response.status() shouldBe HttpStatusCode.Forbidden
                    val res = Json.decodeFromString<ResponseJson>(submitRegCall.response.content!!)
                    res.code shouldBe Response.NotInRange
                    res.title shouldBe "Du kan dessverre ikke melde deg på."
                    val descStart =
                        if (t == HAPPENING_TYPE.BEDPRES) "Denne bedriftspresentasjonen er kun åpen" else "Dette arrangementet er kun åpent"
                    res.desc shouldBe "$descStart for ${exampleHappening4(t).spotRanges[0].minDegreeYear}. til ${
                    exampleHappening4(
                        t
                    ).spotRanges[0].maxDegreeYear
                    }. trinn."
                }
            }
        }
    }

    "Should get correct count of registrations and wait list registrations, and produce correct CSV list" {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            val waitListCount = 10

            for (t in be) {
                val newSlug = "auto-link-test-100-$t"

                val submitHappeningCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        addHeader(
                            HttpHeaders.Authorization,
                            "Basic ${Base64.getEncoder().encodeToString("admin:$adminKey".toByteArray())}"
                        )
                        setBody(
                            Json.encodeToString(
                                exampleHappening6(t).copy(
                                    slug = newSlug
                                )
                            )
                        )
                    }

                submitHappeningCall.response.status() shouldBe HttpStatusCode.OK
                val regsLink = Json.decodeFromString<HappeningResponseJson>(
                    submitHappeningCall.response.content!!,
                ).registrationsLink

                val regsList = mutableListOf<RegistrationJson>()

                for (sr in exampleHappening6(t).spotRanges) {
                    for (i in 1..(sr.spots + waitListCount)) {
                        val submitRegCall: TestApplicationCall =
                            handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                                addHeader(HttpHeaders.ContentType, "application/json")
                                val newReg =
                                    exampleHappeningReg(t).copy(
                                        email = "$t${sr.minDegreeYear}${sr.maxDegreeYear}mIxEdcAsE$i@test.com",
                                        degree = if (sr.maxDegreeYear > 3) Degree.PROG else Degree.DTEK,
                                        degreeYear = if (sr.maxDegreeYear > 3) 4 else 2,
                                        slug = newSlug,
                                        waitList = i > sr.spots
                                    )
                                regsList.add(newReg.copy(email = newReg.email.lowercase()))
                                setBody(Json.encodeToString(newReg))
                            }

                        if (i > sr.spots) {
                            submitRegCall.response.status() shouldBe HttpStatusCode.Accepted
                            val res = Json.decodeFromString<ResponseJson>(submitRegCall.response.content!!)
                            res.code shouldBe Response.WaitList
                            res.title shouldBe "Alle plassene er dessverre fylt opp."
                            res.desc shouldBe "Du er på plass nr. ${i - sr.spots} på ventelisten, og vil bli kontaktet om det åpner seg en ledig plass."
                        } else {
                            submitRegCall.response.status() shouldBe HttpStatusCode.OK
                            val res = Json.decodeFromString<ResponseJson>(submitRegCall.response.content!!)
                            res.code shouldBe Response.OK
                            res.title shouldBe "Påmeldingen din er registrert!"
                            res.desc shouldBe successfulRegMsg(t)
                        }
                    }
                }

                val getCountRegCall: TestApplicationCall =
                    handleRequest(
                        method = HttpMethod.Get,
                        uri = "/${Routing.happeningRoute}/$newSlug"
                    ) {
                        addHeader(
                            HttpHeaders.Authorization,
                            "Basic ${Base64.getEncoder().encodeToString("admin:$adminKey".toByteArray())}"
                        )
                    }

                getCountRegCall.response.status() shouldBe HttpStatusCode.OK
                val happeningInfo = Json.decodeFromString<HappeningInfoJson>(
                    getCountRegCall.response.content!!,
                )

                for (i in happeningInfo.spotRanges.indices) {
                    happeningInfo.spotRanges[i].regCount shouldBe exampleHappening6(t).spotRanges[i].spots
                    happeningInfo.spotRanges[i].waitListCount shouldBe waitListCount
                }

                val getRegistrationsListCall = handleRequest(
                    method = HttpMethod.Get,
                    uri = "/${Routing.registrationRoute}/$regsLink?download=y&testing=y"
                )

                getRegistrationsListCall.response.status() shouldBe HttpStatusCode.OK
                getRegistrationsListCall.response.content!! shouldBe toCsv(regsList, testing = true)

                val getRegistrationsListJsonCall = handleRequest(
                    method = HttpMethod.Get,
                    uri = "/${Routing.registrationRoute}/$regsLink?json=y&testing=y"
                )

                getRegistrationsListJsonCall.response.status() shouldBe HttpStatusCode.OK
                val registrationsList = Json.decodeFromString<List<RegistrationJson>>(
                    getRegistrationsListJsonCall.response.content!!,
                )
                registrationsList.map {
                    it.copy(submitDate = null)
                } shouldBe regsList
            }
        }
    }

    "Should respond properly when given invalid slug of happening when happening info is requested" {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            for (t in be) {
                val getHappeningInfoCall: TestApplicationCall =
                    handleRequest(
                        method = HttpMethod.Get,
                        uri = "/${Routing.happeningRoute}/breh-100"
                    ) {
                        addHeader(
                            HttpHeaders.Authorization,
                            "Basic ${Base64.getEncoder().encodeToString("admin:$adminKey".toByteArray())}"
                        )
                    }

                getHappeningInfoCall.response.status() shouldBe HttpStatusCode.NotFound
                getHappeningInfoCall.response.content!! shouldBe "Happening doesn't exist."
            }
        }
    }

    "Should accept registrations for happening with infinite spots" {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            fun submitReg(type: HAPPENING_TYPE, i: Int) {
                val submitRegCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(
                            Json.encodeToString(
                                exampleHappeningReg(type).copy(
                                    email = "${type}test$i@test.com",
                                    slug = exampleHappening7(type).slug
                                )
                            )
                        )
                    }

                submitRegCall.response.status() shouldBe HttpStatusCode.OK
                val res = Json.decodeFromString<ResponseJson>(submitRegCall.response.content!!)
                res.code shouldBe Response.OK
                res.title shouldBe "Påmeldingen din er registrert!"
                res.desc shouldBe successfulRegMsg(type)
            }

            for (t in be) {
                for (i in 1..1000) {
                    submitReg(t, i)
                }
            }
        }
    }

    "Should redirect if trying to get list of registrations via old FreeMarker page" {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            for (t in be) {
                val newSlug = "auto-link-test-100-$t"

                val submitHappeningCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Put, uri = "/${Routing.happeningRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        addHeader(
                            HttpHeaders.Authorization,
                            "Basic ${Base64.getEncoder().encodeToString("admin:$adminKey".toByteArray())}"
                        )
                        setBody(
                            Json.encodeToString(
                                exampleHappening6(t).copy(
                                    slug = newSlug
                                )
                            )
                        )
                    }

                submitHappeningCall.response.status() shouldBe HttpStatusCode.OK
                val regsLink = Json.decodeFromString<HappeningResponseJson>(
                    submitHappeningCall.response.content!!,
                ).registrationsLink

                val attemptGetRegsCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Get, uri = "/${Routing.registrationRoute}/$regsLink")

                attemptGetRegsCall.response.status() shouldBe HttpStatusCode.MovedPermanently
                attemptGetRegsCall.response.headers["Location"] shouldBe "https://echo.uib.no/${Routing.registrationRoute}/$regsLink"
            }
        }
    }

    "Should delete registrations properly" {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles)
        }) {
            val waitListAmount = 3

            for (t in be) {
                for (i in 1..exampleHappening9(t).spotRanges[0].spots) {
                    val submitRegCall: TestApplicationCall =
                        handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                            addHeader(HttpHeaders.ContentType, "application/json")
                            setBody(
                                Json.encodeToString(
                                    exampleHappeningReg(t).copy(
                                        email = "${t}$i@test.com",
                                        slug = exampleHappening9(t).slug
                                    )
                                )
                            )
                        }

                    submitRegCall.response.status() shouldBe HttpStatusCode.OK
                    val res = Json.decodeFromString<ResponseJson>(submitRegCall.response.content!!)
                    res.code shouldBe Response.OK
                    res.title shouldBe "Påmeldingen din er registrert!"
                    res.desc shouldBe successfulRegMsg(t)
                }

                for (i in 1..waitListAmount) {
                    val submitRegCall: TestApplicationCall =
                        handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                            addHeader(HttpHeaders.ContentType, "application/json")
                            setBody(
                                Json.encodeToString(
                                    exampleHappeningReg(t).copy(
                                        email = "waitlist${t}$i@test.com",
                                        slug = exampleHappening9(t).slug
                                    )
                                )
                            )
                        }

                    submitRegCall.response.status() shouldBe HttpStatusCode.Accepted
                    val res = Json.decodeFromString<ResponseJson>(submitRegCall.response.content!!)
                    val code = Response.WaitList
                    val (_, title, desc) = resToJson(code, t, waitListSpot = i.toLong())

                    res.code shouldBe code
                    res.title shouldBe title
                    res.desc shouldBe desc
                }

                // Delete $waitListAmount registrations, such that all the registrations
                // previously on the wait list are now moved off the wait list.
                for (i in 1..waitListAmount) {
                    val regEmail = "${t}$i@test.com"
                    val nextRegOnWaitListEmail = "waitlist${t}$i@test.com"
                    val deleteRegCall: TestApplicationCall =
                        handleRequest(
                            method = HttpMethod.Delete,
                            uri = "/${Routing.registrationRoute}/${exampleHappening9(t).slug}/$regEmail"
                        )

                    deleteRegCall.response.status() shouldBe HttpStatusCode.OK
                    deleteRegCall.response.content!! shouldBe
                        "Registration with email = ${regEmail.lowercase()} and slug = ${exampleHappening9(t).slug} deleted, " +
                        "and registration with email = ${nextRegOnWaitListEmail.lowercase()} moved off wait list."
                }

                // Delete the registrations that were moved off the wait list in the previous for-loop.
                for (i in 1..waitListAmount) {
                    val waitListRegEmail = "waitlist${t}$i@test.com"
                    val deleteWaitListRegCall: TestApplicationCall =
                        handleRequest(
                            method = HttpMethod.Delete,
                            uri = "/${Routing.registrationRoute}/${exampleHappening9(t).slug}/$waitListRegEmail"
                        )

                    deleteWaitListRegCall.response.status() shouldBe HttpStatusCode.OK
                    deleteWaitListRegCall.response.content!! shouldBe
                        "Registration with email = ${waitListRegEmail.lowercase()} and slug = ${exampleHappening9(t).slug} deleted."
                }
            }
        }
    }

    "Should only be able to sign in via form" {
        withTestApplication({
            configureRouting(adminKey, null, true, featureToggles.copy(verifyRegs = true))
        }) {
            for (t in be) {
                val submitRegFailCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(Json.encodeToString(exampleHappeningReg(t)))
                    }

                submitRegFailCall.response.status() shouldBe HttpStatusCode.Unauthorized
                val resFail = Json.decodeFromString<ResponseJson>(submitRegFailCall.response.content!!)
                resFail shouldNotBe null
                val (_, titleFail, descFail) = resToJson(resFail.code, t)

                resFail.title shouldBe titleFail
                resFail.desc shouldBe descFail

                val submitRegOkCall: TestApplicationCall =
                    handleRequest(method = HttpMethod.Post, uri = "/${Routing.registrationRoute}") {
                        addHeader(HttpHeaders.ContentType, "application/json")
                        setBody(Json.encodeToString(exampleHappeningReg(t).copy(regVerifyToken = exampleHappeningReg(t).slug)))
                    }

                submitRegOkCall.response.status() shouldBe HttpStatusCode.OK
                val resOk = Json.decodeFromString<ResponseJson>(submitRegOkCall.response.content!!)
                resOk shouldNotBe null
                val (_, titleOk, descOk) = resToJson(resOk.code, t)

                resOk.title shouldBe titleOk
                resOk.desc shouldBe descOk
            }
        }
    }
})

fun successfulRegMsg(type: HAPPENING_TYPE): String {
    return when (type) {
        HAPPENING_TYPE.BEDPRES ->
            "Du har fått plass på bedriftspresentasjonen."
        HAPPENING_TYPE.EVENT ->
            "Du har fått plass på arrangementet."
    }
}
