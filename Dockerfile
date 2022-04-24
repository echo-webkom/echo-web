# We use OpenJDK 17 since that is what our Heroku instance uses.
# Download Gradle wrapper and install dependencies.
FROM openjdk:17-jdk-slim AS deps

WORKDIR /opt/build

COPY *.kts gradle.properties gradlew* /opt/build/
COPY gradle gradle

# Add or remove '--info' as needed.
RUN ./gradlew installDist --build-cache --no-daemon


# Build project with downloaded Gradle wrapper and cached dependencies.
FROM openjdk:17-jdk-slim AS build

WORKDIR /opt/build

# Copy Gradle wrapper and dependencies.
COPY --from=deps /root/.gradle /root/.gradle/

# Copy config, and all code except tests.
COPY *.kts gradle.properties gradlew* /opt/build/
COPY gradle gradle
COPY src/main src/main

# Build with Shadow.
# Add or remove '--info' as needed.
RUN ./gradlew shadowJar --build-cache --no-rebuild --no-daemon

# Copy tests after build, so Docker does not rebuild when tests change.
COPY src/test src/test


# Run the server
FROM openjdk:17-jdk-slim

WORKDIR /opt/app

RUN apt update \
 && apt install -yq --no-install-recommends curl

COPY --from=build /opt/build/build/libs/*-all.jar /opt/app/build/libs/
COPY Procfile /opt/app
COPY scripts scripts

# Use Procfile as single source of truth.
CMD cat Procfile | sed -e 's/web: //g' | bash
