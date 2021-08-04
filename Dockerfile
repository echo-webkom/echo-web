# We use OpenJDK 13 since that is what our Heroku instance uses.
# Download Gradle wrapper and install dependencies.
FROM openjdk:13-jdk-slim as deps

WORKDIR /opt/build

COPY *.kts gradle.properties gradlew* ./
COPY gradle gradle

# Add or remove '--info' as needed.
RUN ./gradlew installDist --build-cache --no-daemon


# Build project with downloaded Gradle wrapper and cached dependencies.
FROM openjdk:13-jdk-slim as build

WORKDIR /opt/build

COPY --from=deps /root/.gradle /root/.gradle/
COPY . .

# Build with Shadow.
# Add or remove '--info' as needed.
RUN ./gradlew shadowJar --build-cache --no-rebuild --no-daemon


# Run the server
FROM openjdk:13-jdk-slim

WORKDIR /opt/app

RUN apt-get update \
 && apt-get install -yq --no-install-recommends curl

COPY --from=build /opt/build/build/libs/*-all.jar ./build/libs/
COPY Procfile .
COPY test_scripts test_scripts

# Use Procfile as single source of truth.
CMD cat Procfile | sed -e 's/web: //g' | bash
