package com.scentedmemories.user.service;

import com.scentedmemories.common.exception.DuplicateEmailException;
import com.scentedmemories.common.exception.EntityNotFoundException;
import com.scentedmemories.security.JwtService;
import com.scentedmemories.user.dto.AuthResponse;
import com.scentedmemories.user.dto.LoginRequest;
import com.scentedmemories.user.dto.RegisterRequest;
import com.scentedmemories.user.entity.Role;
import com.scentedmemories.user.entity.User;
import com.scentedmemories.user.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateEmailException("Email already registered: " + request.email());
        }

        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.CUSTOMER);

        userRepository.save(user);

        String token = jwtService.generateToken(user.getId(), user.getRole().name());
        return new AuthResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole().name(), token);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getId(), user.getRole().name());
        return new AuthResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole().name(), token);
    }
}
