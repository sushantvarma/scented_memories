# ── Stage 1: Build ───────────────────────────────────────────────────────────
# Use Eclipse Temurin JDK 21 (LTS) on Alpine for a small build image.
FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /app

# Copy Maven wrapper and pom.xml first — Docker caches this layer separately
# so dependency downloads are skipped on rebuilds when only source changes.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Download dependencies (cached layer — only re-runs when pom.xml changes)
RUN ./mvnw dependency:go-offline -q

# Copy source and build the fat JAR
COPY src/ src/
RUN ./mvnw clean package -DskipTests -q

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
# Use JRE-only image for the final container — smaller and fewer attack surface.
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

# Create a non-root user to run the application
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

# Copy only the fat JAR from the build stage
COPY --from=build /app/target/scented-memories-backend-0.0.1-SNAPSHOT.jar app.jar

# Render injects PORT at runtime (typically 10000).
# The app reads it via ${PORT:8080} in application.properties.
EXPOSE 8080

# JVM flags:
#   -Xmx256m                  — cap heap for Render free tier (512 MB RAM total)
#   -XX:+UseContainerSupport  — respect cgroup memory limits inside the container
#   -Dspring.profiles.active=prod — use production config
#   -Djava.security.egd=...   — faster SecureRandom (avoids /dev/random blocking)
ENTRYPOINT ["java", \
  "-Xmx256m", \
  "-XX:+UseContainerSupport", \
  "-Dspring.profiles.active=prod", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
