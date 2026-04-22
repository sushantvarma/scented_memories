package com.scentedmemories.product.dto;

import java.math.BigDecimal;
import java.util.List;

/** Query parameters for GET /api/products. */
public record ProductFilterParams(
        Long categoryId,
        List<Long> tagIds,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        String search,
        boolean nameOnly   // if true, search matches name only (not description)
) {
    /** Convenience constructor for public API — always searches name + description. */
    public ProductFilterParams(Long categoryId, List<Long> tagIds,
                               BigDecimal minPrice, BigDecimal maxPrice, String search) {
        this(categoryId, tagIds, minPrice, maxPrice, search, false);
    }
}
