package com.scentedmemories.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

public record VariantRequest(
        @NotBlank String label,
        @NotNull @PositiveOrZero BigDecimal price,
        @PositiveOrZero int stock
) {}
