package com.scentedmemories.order.dto;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long id,
        Long variantId,
        String productNameSnap,
        String variantLabelSnap,
        BigDecimal unitPriceSnap,
        int quantity
) {}
