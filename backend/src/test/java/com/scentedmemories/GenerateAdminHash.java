package com.scentedmemories;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Run once to generate a correct bcrypt hash for the admin password.
 * Usage: ./mvnw test -Dtest=GenerateAdminHash -pl .
 */
public class GenerateAdminHash {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
        String hash = encoder.encode("Admin@123");
        System.out.println("\n✅ Bcrypt hash for Admin@123:");
        System.out.println(hash);
        System.out.println();
    }
}
