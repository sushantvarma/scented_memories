-- =============================================================================
-- V6__create_feedback_table.sql
-- Customer feedback / testimonials submitted via the storefront.
-- =============================================================================
CREATE TABLE feedback (
    id         BIGSERIAL    PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL,
    message    TEXT         NOT NULL,
    rating     INT          NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_created ON feedback (created_at DESC);
