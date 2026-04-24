package com.scentedmemories.feedback.dto;

import java.time.OffsetDateTime;

public record FeedbackResponse(
        Long id,
        String name,
        String message,
        int rating,
        OffsetDateTime createdAt
        // email intentionally omitted from public response
) {}
