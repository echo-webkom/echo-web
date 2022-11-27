# echo web backend

Backend til nettsiden til echo – Linjeforeningen for informatikk.

## Oppsett for utviklere

**1. Klon Git-repoet.**

    git clone git@github.com:echo-webkom/echo-web

**2. Naviger til riktig mappe.**

    cd echo-web/backend

**3. Kopier innholdet i `.env.example` til en fil med navn `.env` (og evt. fyll inn verdier for feltene).**

    cp .env.example .env

**4. Start en container med serveren og Postgres (du trenger [Docker](https://docs.docker.com/compose/install) for dette).**

    docker compose up --build

Serveren starter på `localhost:8080`, eller `localhost:$PORT` dersom $PORT er definert.

#### Auto-formattering

For å aktivere automatisk kodeformattering som kjører hver gang
du commiter, kan du kjøre denne kommandoen (mens du er i Git-repoet):

    ./gradlew addKtlintFormatGitPreCommitHook

#### Sette inn test-data

For å sette inn test-data i databasen, kan du kjøre denne kommandoen,
mens backend og databasen kjører:

    ./scripts/restore
