package com.scentedmemories.feedback.dto;

import jakarta.validation.constraints.*;

public record FeedbackRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 255)
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email address")
        @Size(max = 255)
        String email,

        @NotBlank(message = "Message is required")
        @Size(min = 20, message = "Message must be at least 20 characters")
        @Size(max = 2000)
        String message,

        @Min(value = 1, message = "Rating must be between 1 and 5")
        @Max(value = 5, message = "Rating must be between 1 and 5")
        int rating
) {}
