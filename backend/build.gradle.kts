import com.adarshr.gradle.testlogger.theme.ThemeType
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

val ktorVersion: String by project
val logbackVersion: String by project
val exposedVersion: String by project
val postgresVersion: String by project
val hikariVersion: String by project
val kotestVersion: String by project
val flywayVersion: String by project

// Needed for Shadow
project.setProperty("mainClassName", "no.uib.echo.ApplicationKt")

plugins {
    application
    kotlin("jvm") version "1.9.20"
    kotlin("plugin.serialization") version "1.9.20"
    id("com.github.johnrengelman.shadow") version "8.1.1"
    id("org.jlleitschuh.gradle.ktlint") version "12.0.3"
    id("com.adarshr.test-logger") version "4.0.0"
}

group = "no.uib.echo"
version = "0.0.1"

application {
    mainClass.set("no.uib.echo.ApplicationKt")
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("io.ktor:ktor-server-core:$ktorVersion")
    implementation("io.ktor:ktor-server-netty:$ktorVersion")
    implementation("io.ktor:ktor-server-content-negotiation:$ktorVersion")
    implementation("io.ktor:ktor-server-cors:$ktorVersion")
    implementation("io.ktor:ktor-server-auth:$ktorVersion")
    implementation("io.ktor:ktor-server-auth-jwt:$ktorVersion")
    implementation("io.ktor:ktor-server-rate-limit:$ktorVersion")
    implementation("io.ktor:ktor-server-openapi:$ktorVersion")
    implementation("io.ktor:ktor-server-swagger:$ktorVersion")

    implementation("io.ktor:ktor-client-core:$ktorVersion")
    implementation("io.ktor:ktor-client-cio:$ktorVersion")
    implementation("io.ktor:ktor-client-logging:$ktorVersion")
    implementation("io.ktor:ktor-client-serialization:$ktorVersion")
    implementation("io.ktor:ktor-client-content-negotiation:$ktorVersion")

    implementation("io.ktor:ktor-serialization-kotlinx-json:$ktorVersion")

    implementation("ch.qos.logback:logback-classic:$logbackVersion")

    implementation("org.jetbrains.exposed:exposed-core:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-dao:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-jdbc:$exposedVersion")
    implementation("org.jetbrains.exposed:exposed-jodatime:$exposedVersion")

    implementation("org.postgresql:postgresql:$postgresVersion")

    implementation("com.zaxxer:HikariCP:$hikariVersion")

    implementation("org.flywaydb:flyway-core:$flywayVersion")

    testImplementation("io.ktor:ktor-server-test-host:$ktorVersion")

    testImplementation("io.kotest:kotest-assertions-core:$kotestVersion")

    testImplementation("org.jetbrains.kotlin:kotlin-test:1.9.20")
}

// Used for Shadow. Sets main class in JAR-file.
tasks.withType<Jar> {
    manifest {
        attributes(
            mapOf(
                "Main-Class" to application.mainClass,
            ),
        )
    }
}

// Make tests accessible to Gradle.
tasks.withType<Test> {
    useJUnitPlatform()
}

// Test logging config.
testlogger {
    theme = ThemeType.STANDARD
    showExceptions = true
    showStackTraces = true
    showFullStackTraces = true
    showCauses = true
    slowThreshold = 2000
    showSummary = true
    showSimpleNames = false
    showPassed = true
    showSkipped = true
    showFailed = true
    showStandardStreams = false
    showPassedStandardStreams = true
    showSkippedStandardStreams = true
    showFailedStandardStreams = true
    logLevel = LogLevel.LIFECYCLE
}

// Set JVM target for Java.
java {
    toolchain.languageVersion.set(JavaLanguageVersion.of(17))
}

// Set JVM target for Kotlin.
tasks.withType<KotlinCompile>().configureEach {
    kotlinOptions {
        jvmTarget = "17"
    }
}
