package com.scentedmemories;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

class GenerateAdminHashTest {

    @Test
    void printHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
        String hash = encoder.encode("Admin@123");
        System.out.println("\n✅ BCRYPT HASH: " + hash + "\n");
        // Also verify it matches
        System.out.println("✅ VERIFY: " + encoder.matches("Admin@123", hash));
    }
}
