package com.scentedmemories.feedback.repository;

import com.scentedmemories.feedback.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    /** Most recent feedback first — used for the public testimonials carousel. */
    List<Feedback> findTop20ByOrderByCreatedAtDesc();
}
