package com.scentedmemories.product.dto;

import java.math.BigDecimal;
import java.util.List;

/** Query parameters for GET /api/products. */
public record ProductFilterParams(
        Long categoryId,
        List<Long> tagIds,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        String search
) {}
