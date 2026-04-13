package com.scentedmemories.user.dto;

public record AuthResponse(Long id, String fullName, String email, String role, String token) {}
