package com.scentedmemories.feedback.controller;

import com.scentedmemories.feedback.dto.FeedbackRequest;
import com.scentedmemories.feedback.dto.FeedbackResponse;
import com.scentedmemories.feedback.entity.Feedback;
import com.scentedmemories.feedback.repository.FeedbackRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public feedback endpoints — no authentication required.
 *
 * POST /api/feedback        — submit feedback (public)
 * GET  /api/feedback        — retrieve recent feedback for testimonials carousel (public)
 * GET  /api/admin/feedback  — retrieve all feedback with emails (ADMIN, handled in SecurityConfig)
 */
@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;

    public FeedbackController(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    /** Submit new feedback — public, no auth required. */
    @PostMapping
    public ResponseEntity<FeedbackResponse> submit(@Valid @RequestBody FeedbackRequest request) {
        Feedback feedback = new Feedback();
        feedback.setName(request.name());
        feedback.setEmail(request.email());
        feedback.setMessage(request.message());
        feedback.setRating(request.rating());

        Feedback saved = feedbackRepository.save(feedback);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(saved));
    }

    /** Get recent feedback for the public testimonials carousel — email excluded. */
    @GetMapping
    public ResponseEntity<List<FeedbackResponse>> list() {
        List<FeedbackResponse> responses = feedbackRepository
                .findTop20ByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

    private FeedbackResponse toResponse(Feedback f) {
        return new FeedbackResponse(f.getId(), f.getName(), f.getMessage(), f.getRating(), f.getCreatedAt());
    }
}
