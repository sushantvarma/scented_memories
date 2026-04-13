package com.scentedmemories.product.dto;

import java.util.List;

/** Returned for GET /api/products/{slug}. */
public record ProductDetailResponse(
        Long id,
        String slug,
        String name,
        String description,
        List<String> images,
        CategoryResponse category,
        List<TagResponse> tags,
        List<VariantResponse> variants,
        boolean active
) {}
