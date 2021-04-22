# echo web backend

[![Deploy to Heroku](https://github.com/echo-webkom/echo-web-backend/actions/workflows/build_deploy.yaml/badge.svg?branch=master)](https://github.com/echo-webkom/echo-web-backend/actions/workflows/build_deploy.yaml)
[![Build & test](https://github.com/echo-webkom/echo-web-backend/actions/workflows/build_test.yaml/badge.svg)](https://github.com/echo-webkom/echo-web-backend/actions/workflows/build_test.yaml)

Backend til nettsiden til **echo – Fagutvalget for informatikk** ved Universitetet i Bergen.

Utviklet av frivillige informatikkstudenter fra undergruppen **echo Webkom**.

## Oppsett for utviklere

1. Klon Git-repoet.

        git clone git@github.com:echo-webkom/echo-web-backend

2. Naviger til riktig mappe.

        cd echo-web-backend

3. Start en container med serveren og Postgres (du trenger [Docker](https://docs.docker.com/compose/install) for dette).

        docker-compose up

Serveren starter på `localhost:5000`, eller `localhost:$PORT` dersom $PORT er definert.
