# echo web backend

[![Build](https://github.com/echo-webkom/echo-web-backend/actions/workflows/build.yaml/badge.svg)](https://github.com/echo-webkom/echo-web-backend/actions/workflows/build.yaml)
[![Tests](https://github.com/echo-webkom/echo-web-backend/actions/workflows/test.yaml/badge.svg)](https://github.com/echo-webkom/echo-web-backend/actions/workflows/test.yaml)


Backend til nettsiden til **echo – Fagutvalget for informatikk** ved Universitetet i Bergen.

Utviklet av frivillige informatikkstudenter fra undergruppen **echo Webkom**.

## Oppsett for utviklere

**1. Klon Git-repoet.**

    git clone git@github.com:echo-webkom/echo-web-backend

**2. Naviger til riktig mappe.**

    cd echo-web-backend

**3. Start en container med serveren og Postgres (du trenger [Docker](https://docs.docker.com/compose/install) for dette).**

    docker-compose up --build

Serveren starter på `localhost:8080`, eller `localhost:$PORT` dersom $PORT er definert.
