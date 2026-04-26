package com.scentedmemories.product.dto;

import java.math.BigDecimal;
import java.util.List;

/** Returned in paginated product listing (GET /api/products). */
public record ProductSummaryResponse(
        Long id,
        String slug,
        String name,
        String primaryImageUrl,
        BigDecimal startingPrice,
        CategoryResponse category,
        List<TagResponse> tags,
        Integer totalStock   // sum of stock across all active variants; null for public API
) {}
