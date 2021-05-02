# We use OpenJDK 8 since Heroku uses it by default.
# Download Gradle wrapper and install dependencies.
FROM openjdk:8-jdk-buster as deps

WORKDIR /opt/build
COPY *.kts gradle.properties gradlew* ./
COPY gradle gradle

# Add or remove '--info' as needed.
RUN ./gradlew installDist --build-cache --no-daemon


# Build project with downloaded Gradle wrapper and cached dependencies.
FROM openjdk:8-jdk-buster as build

WORKDIR /opt/build
COPY --from=deps /root/.gradle /root/.gradle/
COPY . .

# Build with Shadow.
# Add or remove '--info' as needed.
RUN ./gradlew shadowJar --build-cache --no-rebuild --no-daemon


# Run the server
FROM openjdk:8-jdk-buster
WORKDIR /opt/app

# NB! This might break if version or name changes.
# Should probably use some environment variable or something.
COPY --from=build /opt/build/build/libs/echo-web-backend-0.0.1-all.jar .
COPY Procfile .

# NB! This might break if version or name changes.
# Should probably use some environment variable or something.
CMD java -jar -Djava.security.egd=file:/dev/./urandom echo-web-backend-0.0.1-all.jar
