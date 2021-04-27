# Download Gradle wrapper and install dependencies.
FROM openjdk:11-jdk-buster as deps

WORKDIR /opt/build
COPY *.kts gradle.properties gradlew* /opt/build/
COPY gradle /opt/build/gradle

# Add or remove '--info' as needed.
RUN ./gradlew installDist --no-daemon


# Build project with downloaded Gradle wrapper and cached dependencies.
FROM openjdk:11-jdk-buster as build

WORKDIR /opt/build
COPY --from=deps /root/.gradle /root/.gradle/
COPY . /opt/build/

# Build with Shadow.
# Add or remove '--info' as needed.
RUN ./gradlew shadowJar --build-cache --no-daemon --no-rebuild


# Run the server
FROM openjdk:11-jdk-buster
WORKDIR /opt/app

# NB! This might break if version or name changes.
# SHould probably use some environment variable or something.
COPY --from=build /opt/build/build/libs/echo-web-backend-0.0.1-all.jar .

# NB! This might break if version or name changes.
# SHould probably use some environment variable or something.
CMD java -jar -Djava.security.egd=file:/dev/./urandom echo-web-backend-0.0.1-all.jar
