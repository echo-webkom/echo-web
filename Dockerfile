FROM gradle:latest as build
WORKDIR /opt/build
COPY . /opt/build
RUN ./gradlew shadowJar

FROM openjdk:11-jre-buster
WORKDIR /opt/app
# Default value if no environment variable is set
ENV PORT 8080
# NB! This might break if version or name changes
COPY --from=build /opt/build/build/libs/echo-web-backend-0.0.1-all.jar .
# NB! This might break if version or name changes
CMD java -jar -Djava.security.egd=file:/dev/./urandom echo-web-backend-0.0.1-all.jar -port=$PORT
