package com.scentedmemories.user.service;

import com.scentedmemories.user.dto.AuthResponse;
import com.scentedmemories.user.dto.LoginRequest;
import com.scentedmemories.user.dto.RegisterRequest;

public interface AuthService {

    /** Register a new CUSTOMER account. Returns JWT on success. */
    AuthResponse register(RegisterRequest request);

    /** Authenticate existing user. Returns JWT on success. */
    AuthResponse login(LoginRequest request);
}
