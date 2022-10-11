# Backend-workshop i Kotlin, Ktor og Exposed

# Oppsett

**1.** Last ned [IntelliJ](https://www.jetbrains.com/idea/download) og [Docker](https://www.docker.com/products/docker-desktop).

**2.** Oprett en fil som heter `.env` og ser slik ut:

```
ADMIN_KEY=admin-passord
```

**3.** Du kan bruke scriptet `start` som ligger i denne mappen for å starte serveren ordentlig:

    ./workshop/start

... eller kjøre disse kommandoene:

    docker-compose down
    docker-compose up --build

**4.** Om alt fungerer, burde du se serveren [her](http://localhost:8080).

# 1 – Lag ditt første endepunkt

### Endepunkter

Ett **endepunkt** er en nettadresse som serveren din er tilgjengelig på.
Forskjellige endpunkter har forskjellige funksjoner.

Serveren du skal jobbe med nå er tilgjengelig på `http://localhost:8080`.
Ved å legge til ekstra tekst på slutten av denne nettadressen, kan vi nå serveren sine endepunkter.

(Vi dropper å skrive hele adressen; alt før `/` er adressen over)

`/status` - sjekke om serveren kjører

`/registration` - sende inn en påmelding

`/happening` - sende inn et nytt arrangement/bedpres

... osv

### Hoppscotch

For å teste endeunktene våre, skal vi bruke **Hoppscotch**.
I hver oppgave ligger det en link du kan trykke på for å gå inn
på en nettside som lar deg lage, redigere og sende forespørsler.

## 📝 Syntaks

#### Lage et endepukt med `GET`-metoden

```kotlin
get("/endepunkt") {
    ...
}
```

#### Svare på en forespørsel til et endepunkt

```kotlin
call.respond("Tekst du vil svare med")
```

## 🔨 Oppgaven

**Lag ett endepunkt** med adressen `/greeting` som bruker `GET`-metoden
og svarer med teksten `Hei!`.

<details>
  <summary>✨ Se fasit</summary>

```kotlin
fun Application.workshopRouting() {
    routing {
        get("/greeting") {
            call.respond("Hei!")
        }
    }
}
```

</details>

## 🧪 Test endepunktet!

https://hopp.sh/r/qQPo10pxGGFZ

# 2 – Dynamiske endepunkter

Vi kan også ha variabler i adressene våre, slik at endepunktene blir mer dynamiske og intuitive.

## 📝 Syntaks

#### Ta i mot en variabel i nettadressen

```kotlin
get("/asd/{variabelNavn?}/def") {
    val variabel = call.parameters["variabelNavn"]

    ...
}
```

#### Sjekke `null`

```kotlin
if (variabel == null) {
    ...
} else {
    ...
}
```

#### Bruke variabler i en streng

```kotlin
val name = "Johnny"

call.respond("Du heter ${name}.")
```

## 🔨 Oppgaven

**Endre endepunktet** fra forrige oppgave til adressen `/greeting/{navn?}`, der vi tar inn en variabel `{navn?}`
og svarer med teksten `Hei {navn?}!`. Om `{navn?}` ikke finnes (altså at den er `null`), skal du svare med bare `Hei!`.

<details>
  <summary>✨ Se fasit</summary>

```kotlin
fun Application.workshopRouting() {
    routing {
        get("/greeting/{navn?}") {
            val name = call.parameters["navn"]

            if (name == null) {
                call.respond("Hei!")
            } else {
                call.respond("Hei $name!")
            }
        }
    }
}
```

</details>

## 🧪 Test endepunktet!

https://hopp.sh/r/xNUme7XfhlMH

# 3 – HTTP-kode på forespørselsvar

## 📝 Syntaks

#### Svare med HTTP-kode

```kotlin
call.respond(HttpStatusCode.OK, "Alt gikk fint")

call.respond(HttpStatusCode.BadRequest, "Du har sendt noe feil")

call.respond(HttpStatusCode.NotFound, "Fant ikke det du spurte etter")

call.respond(HttpStatusCode.InternalServerError, "Det har skjedd en feil")
```

## 🔨 Oppgaven

**Endre endepunktet** fra forrige oppgave, slik at du svarer med koden `OK` om `{navn?}` er definert,
og koden `BadRequest` om `{navn?}` er `null`.

<details>
  <summary>✨ Se fasit</summary>

```kotlin
fun Application.workshopRouting() {
    routing {
        get("/greeting/{navn?}") {
            val name = call.parameters["navn"]

            if (name == null) {
                call.respond(HttpStatusCode.BadRequest, "Navn ikke definert")
            } else {
                call.respond(HttpStatusCode.OK, "Hei $name!")
            }
        }
    }
}
```

</details>

## 🧪 Test endepunktet!

#### Samme link som i forrige oppgave

# 4 – Forespørsler med data

Vi kan også sende med data i form av JSON i forespørslene våre.

## 📝 Syntaks

#### Lage en mal for et JSON-objekt

```kotlin
data class TestJson(
    val field1: Int,
    val field2: String,
    val field3: Boolean,
    ...
)
```

#### Ta i mot JSON med formatet `TestJson` i en forespørsel

```kotlin
try {
    val json = call.receive<TestJson>()

    call.respond(json.field2)

    ...

} catch (e: Exception) {
    // printer hva som har skjedd feil
    e.printStackTrace()

    // håndter feilen her
}
```

#### Returnere tidlig (avslutte funksjonen)

```kotlin
get("/halloi") {
    if (true) {
        call.respond("Snakkes")
        return@get // <---------
    }

    call.respond("Denne koden vil aldri kjøre.")
}
```

Legg merkge til at `@get` matcher typen til metoden (i dette tilfelle `GET`).

Dersom vi har et endepunkt definert som `post("/halloi) { ... }`,
må vi bruke `return@post`.

## 🔨 Oppgaven

**Ende endepunktet** fra forrige oppgave, slikt at det tar i mot et JSON-objekt med feltene `age`, `occupation` og `location`,
på adressen `/person/{navn?}` der `{navn?}` bestemmer navnet på personen.
Bruk `POST`-metoden.

-   Dersom `{navn?}` er `null`, svar med `BadRequest` og avslutt funksjonen.
-   Dersom JSON har riktig format, svar med `OK` og en streng der du bruker alle feltene i JSON-objektet.
-   Dersom JSON ikke har riktig format, svar med `InternalServerError` og en feilmelding.

<details>
  <summary>✨ Se fasit</summary>

```kotlin
data class PersonJson(
    val age: Int,
    val occupation: String,
    val location: String
)

fun Application.workshopRouting() {
    routing {
        post("/person/{navn?}") {
            val name = call.parameters["navn"]

            if (name == null) {
                call.respond(HttpStatusCode.BadRequest, "Navn er ikke definert.")
                return@post
            }

            try {
                val person = call.receive<PersonJson>()

                call.respond(
                    HttpStatusCode.OK,
                    "Hei ${name}! Du er ${person.age} år gammel, er ${person.occupation} og bor i ${person.location}."
                )
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, "Det har skjedd en feil.")
            }
        }
    }
}
```

</details>

## 🧪 Test endepunktet!

https://hopp.sh/r/wbChZe9XqtDS

# 5 – Lag en tabell i databasen

Til nå har vi ikke lagret dataen vi har fått i forespørslene noe sted.
Vi kan bruke rammeverket **Exposed** for å lage tabeller i en database der vi kan lagre data.

## 📝 Syntaks

#### Definere en tabell i databasen

```kotlin
object Test : Table() {
    val field1: Column<Int> = integer("field1").uniqueIndex()
    val field2: Column<String> = text("field2")
    val field3: Column<Boolean> = boolean("field3")

    ...

    override val primaryKey = PrimaryKey(field1)
}
```

`.uniqueIndex()` betyr at verdien i det feltet er unikt;
dersom én rad i databasen har f.eks. `field1 = 7`, kan ingen andre rader
ha samme verdi for `field1`.

## 🔨 Oppgaven

Lag en tabell for `PersonJson` som heter `Person`, med de samme feltene og riktig datatyper.

`name` kan være `PrimaryKey`, og skal være unik.

<details>
  <summary>✨ Se fasit</summary>

```kotlin
object Person : Table () {
    val name: Column<String> = text("name").uniqueIndex()
    val age: Column<Int> = integer("age")
    val occupation: Column<String> = text("occupation")
    val location: Column<String> = text("location")

    override val primaryKey = PrimaryKey(name)
}
```

</details>

# 6 – Lagre data i databasen

Vi har nå laget en tabell, men ikke lagret noe data enda.
For å lagre data, må vi kjøre **SQL-spørringer**. Dette kan vi gjøre
i Kotlin via rammeverket **Exposed**.

⚠️ **Før du begynner å løse oppgaven:** ⚠️

Legg til denne kodesnutten i toppen av `Application.configureRouting()`:

```kotlin
fun Application.configureRouting() {
    transaction {
        SchemaUtils.create(Person)
    }

    ...
}
```

Dette vil opprette tabellen `Person` i databasen vår, slik at vi kan bruke den.

## 📝 Syntaks

#### Kjøre en spørring i databasen

```kotlin
transaction {
    // dette er for å logge hva spørirngen gjør i konsollen
    addLogger(StdOutSqlLogger)

    // spørringer her
}
```

⚠️ _**Alle spørringer må være inne en slik `transaction`-blokk**_ ⚠️

#### `INSERT`-spørring (sett inn data)

```kotlin
Test.insert {
    it[Test.field1] = 2
    it[Test.field2] = "asd"
    it[Test.field3] = true

    ...
}
```

## 🔨 Oppgaven

**Ende endepunktet** fra forrige oppgave, slik at dataen fra JSON-objektet
du tar inn blir satt inn i databasen i tabellen `Person`.

<details>
  <summary>✨ Se fasit</summary>

```kotlin
data class PersonJson(
    val age: Int,
    val occupation: String,
    val location: String
)

object Person : Table () {
    val name: Column<String> = text("name").uniqueIndex()
    val age: Column<Int> = integer("age")
    val occupation: Column<String> = text("occupation")
    val location: Column<String> = text("location")

    override val primaryKey = PrimaryKey(name)
}

fun Application.workshopRouting() {
    routing {
        post("/person/{navn?}") {
            val name = call.parameters["navn"]

            if (name == null) {
                call.respond(HttpStatusCode.BadRequest, "Navn er ikke definert.")
                return@post
            }

            try {
                val person = call.receive<PersonJson>()

                transaction {
                    addLogger(StdOutSqlLogger)

                    Person.insert {
                        it[Person.name] = name
                        it[Person.age] = person.age
                        it[Person.occupation] = person.occupation
                        it[Person.location] = person.location
                    }
                }

                call.respond(HttpStatusCode.OK, "Alt gikk som det skulle")
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, "Det har skjedd en feil.")
            }
        }
    }
}
```

</details>

## 🧪 Test endepunktet!

https://hopp.sh/r/wbChZe9XqtDS

_(Samme som forrige oppgave)_

# 7 – Hent ut data fra databasen

I forrige oppgave oprettet vi en ny person,
uten så sjekke om denne personen allerede fantes.
Det hadde vært smart å først sjekke om denne personen
finnes før vi prøve å oprette den på nytt.

## 📝 Syntaks

#### `SELECT`-spørring (hent ut data)

```kotlin
val verdi = 2

Test.select {
    Test.field1 eq verdi
}.firstOrNull()
```

#### Lagre resultatet fra en `transaction`

```kotlin
val result = transaction {

    ...
}

```

## 🔨 Oppgaven

**Endre endepunktet** fra forrige oppgave slik at du
sjekker om det finnes en person før du opretter en ny.

Dersom det allerede finnes en person, returner `BadRequest` og en feilmelding,
og avslutt funksjonen.

<details>
  <summary>✨ Se fasit</summary>

```kotlin
data class PersonJson(
    val age: Int,
    val occupation: String,
    val location: String
)

object Person : Table () {
    val name: Column<String> = text("name").uniqueIndex()
    val age: Column<Int> = integer("age")
    val occupation: Column<String> = text("occupation")
    val location: Column<String> = text("location")

    override val primaryKey = PrimaryKey(name)
}

fun Application.workshopRouting() {
    routing {
        post("/person/{navn?}") {
            val name = call.parameters["navn"]

            if (name == null) {
                call.respond(HttpStatusCode.BadRequest, "Navn er ikke definert.")
                return@post
            }

            try {
                val newPerson = call.receive<PersonJson>()

                val person = transaction {
                    addLogger(StdOutSqlLogger)

                    Person.select {
                        Person.name eq newPerson.name
                    }.firstOrNull()
                }

                if (person != null) {
                    call.respond(
                        HttpStatusCode.BadRequest,
                        "Det finnes allerede en person med navn ${newPerson.name}!"
                    )
                    return@post
                }

                transaction {
                    addLogger(StdOutSqlLogger)

                    Person.insert {
                        it[Person.name] = name
                        it[Person.age] = newPerson.age
                        it[Person.occupation] = newPerson.occupation
                        it[Person.location] = newPerson.location
                    }
                }

                call.respond(HttpStatusCode.OK, "Oprettet ny person med navn ${newPerson.name}.")
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, "Det har skjedd en feil.")
            }
        }
    }
}
```

</details>

## 🧪 Test endepunktet!

https://hopp.sh/r/wbChZe9XqtDS

_(Samme som forrige oppgave)_

# 8 – Oppdater en rad i databasen

I stedet for å returnere en feilmelding dersom det allerede
finnes en person med samme navn, kan vi oppdatere dataen til
personen som har det navnet.

**Lag et nytt endepunkt** med `PUT`-metoden, som sjekker om personen finnes i databasen.

-   Dersom den gjør det, oppdaterer den informasjonen til personen.
-   Dersom den ikke gjør det, oppretter den en ny person.

## 📝 Syntaks

#### `UPDATE`-spørring (oppdater data)

```kotlin
val test = TestJson(123, "Def", false)

// opdaterer der hvor field1 i databasen matcher test.field1
Test.update({ Test.field1 eq test.field1 }) {
    it[Test.field2] = test.field2
    it[Test.field3] = test.field3
}
```

<details>
  <summary>✨ Se fasit</summary>

```kotlin
data class PersonJson(
    val age: Int,
    val occupation: String,
    val location: String
)

object Person : Table () {
    val name: Column<String> = text("name").uniqueIndex()
    val age: Column<Int> = integer("age")
    val occupation: Column<String> = text("occupation")
    val location: Column<String> = text("location")

    override val primaryKey = PrimaryKey(name)
}

fun Application.workshopRouting() {
    routing {
        put("/person/{navn?}") {
            val name = call.parameters["navn"]

            if (name == null) {
                call.respond(HttpStatusCode.BadRequest, "Navn er ikke definert.")
                return@put
            }

            try {
                val newPerson = call.receive<PersonJson>()

                val person = transaction {
                    addLogger(StdOutSqlLogger)

                    Person.select {
                        Person.name eq newPerson.name
                    }.firstOrNull()
                }

                if (person != null) {
                    transaction {
                        addLogger(StdOutSqlLogger)

                        Person.update({ Person.name eq name }) {
                            it[Person.age] = newPerson.age
                            it[Person.occupation] = newPerson.occupation
                            it[Person.location] = newPerson.location
                        }
                    }
                    return@post
                }

                transaction {
                    addLogger(StdOutSqlLogger)

                    Person.insert {
                        it[Person.name] = name
                        it[Person.age] = person.age
                        it[Person.occupation] = person.occupation
                        it[Person.location] = person.location
                    }
                }

                call.respond(HttpStatusCode.OK, "Oprettet ny person med navn ${newPerson.name}.")
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, "Det har skjedd en feil.")
            }
        }
    }
}
```

</details>

## 🧪 Test endepunktet!

https://hopp.sh/r/VloU6MpupM3u

# 9 – Slett en rad i databasen

Nå har vi vært gjennom `GET`-, `POST`- og `PUT`-metodene.

Da mangler vi bare `DELETE`!

## 📝 Syntaks

#### `DELETE`-spørring (slett data)

```kotlin
val num = 123

Test.deleteWhere({ Test.field1 eq num })
```

## 🔨 Oppgaven

**Lag et nytt endepunkt** med `DELETE`-metoden og adressen `/person/{navn?}`, som sletter personen
med navnet `{navn?}`. Gjør de samme sjekkene for `null` som tidligere, og gi passende svar på forespørselen.

<details>
  <summary>✨ Se fasit</summary>

```kotlin
delete("/person/{navn?}") {
    val name = call.parameters["navn"]

    if (name == null)
        call.respond(HttpStatusCode.BadRequest, "Navn er ikke definert")
        return@delete
    }

    transaction {
        addLogger(StdOutSqlLogger)

        Person.deleteWhere {
            Person.name eq name
        }
    }

    call.respond(HttpStatusCode.OK, "Person med navnet '${name}' har blitt slettet!")
}

```

</details>

## 🧪 Test endepunktet!

https://hopp.sh/r/Y3IyLHiMxDhS
