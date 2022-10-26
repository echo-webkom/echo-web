# echo web

<a href="https://sanity.io" target="_blank" rel="noopener"><img src="https://cdn.sanity.io/images/3do82whm/next/51af00784c5addcf63ae7f0c416756acca7e63ac-353x71.svg?dl=sanity-logo.svg" width="180" alt="Powered by Sanity" /></a>
<a href="https://vercel.com/?utm_source=echo-webkom&utm_campaign=oss" target="_blank" rel="noopener">
<img src="frontend/public/powered-by-vercel.svg" width="175" alt="Powered by Vercel" />
</a>

Full-stack monorepo for nettsiden til **echo – Linjeforeningen for informatikk** ved Universitetet i Bergen.

Utviklet av frivillige informatikkstudenter fra undergruppen **echo Webkom**.

## Tilbakemeldinger

Har du noen tilbakemeldinger til nettsiden?
Vi jobber hele tiden med å forbedre den,
og setter stor pris på om du sier ifra om noe er feil,
eller du har idéer til nye endringer!

Fyll gjerne ut skjemaet [her](https://forms.gle/r9LNMFjanUNP7Gph9),
eller send oss en mail på [webkom-styret@echo.uib.no](mailto:webkom-styret@echo.uib.no).

# Oppsett for utviklere

## Frontend

**1. Klon Git-repoet.**

    git clone git@github.com:echo-webkom/echo-web

**2. Naviger til riktig mappe.**

    cd echo-web

**3. Installer dependencies (du trenger [yarn](https://classic.yarnpkg.com/en/docs/install) for dette).**

    yarn

**4. Naviger til riktig mappe.**

    cd frontend

**5. Kopier innholdet i `.env.example` til en fil med navn `.env` (og evt. fyll inn verdier for feltene).**

    cp .env.example .env

**6. Start en lokal server.**

    yarn dev

Gå til `localhost:3000` i en nettleser for å se nettsiden.

## Backend

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

    ./scripts/restore test_data.dump

## CMS

**1. Klon Git-repoet.**

    git clone git@github.com:echo-webkom/echo-web

**2. Naviger til riktig mappe.**

    cd echo-web

**3. Installer dependencies (du trenger [yarn](https://classic.yarnpkg.com/en/docs/install) for dette).**

    yarn

**4. Naviger til riktig mappe.**

    cd cms

**5. Start en lokal server.**

    yarn start

Gå til `localhost:3333` i en nettleser, og logg inn med din Sanity-bruker.
