package com.scentedmemories.product.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.Set;

public record CreateProductRequest(
        @NotBlank String name,
        String description,
        @NotNull Long categoryId,
        Set<Long> tagIds,
        List<String> imageUrls,
        @NotEmpty @Valid List<VariantRequest> variants
) {}
