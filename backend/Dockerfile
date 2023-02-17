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
RUN ./gradlew shadowJar --build-cache --no-daemon

# Copy tests after build, so Docker does not rebuild when tests change.
COPY src/test src/test


# Run the server
FROM openjdk:17-jdk-slim

WORKDIR /opt/app

COPY --from=build /opt/build/build/libs/echo-web-backend-0.0.1-all.jar /opt/app/build/libs/

CMD ["java", "-jar", "/opt/app/build/libs/echo-web-backend-0.0.1-all.jar"]
