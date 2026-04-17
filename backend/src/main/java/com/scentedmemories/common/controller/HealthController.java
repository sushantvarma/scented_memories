package com.scentedmemories.common.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Lightweight diagnostic endpoints used to verify deployment health.
 * Both endpoints are publicly accessible (no JWT required).
 *
 * GET /health — used by Render's health check and uptime monitors.
 * GET /test   — smoke-test that confirms the app is running and returning JSON.
 */
@RestController
public class HealthController {

    /**
     * Render pings this endpoint after every deploy to confirm the service is up.
     * Returns plain "UP" with HTTP 200. Intentionally minimal — no DB call,
     * so it responds even if the database is temporarily unreachable.
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("UP");
    }

    /**
     * Smoke-test endpoint. Returns a small JSON payload confirming the app name,
     * status, and current server timestamp. Useful for verifying JSON serialization
     * and that the app is fully initialised after a cold start.
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> test() {
        return ResponseEntity.ok(Map.of(
                "app",       "scented-memories-backend",
                "status",    "running",
                "timestamp", Instant.now().toString()
        ));
    }
}
