FROM gradle:latest as build
WORKDIR /opt/build
COPY build.gradle.kts gradle.properties /opt/build/
COPY src /opt/build/src
RUN gradle clean build

FROM gradle:latest
WORKDIR /opt/app
COPY --from=build /opt/build .
EXPOSE 80
CMD ["gradle", "run"]
