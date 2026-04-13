package com.scentedmemories.product.dto;

import java.math.BigDecimal;

public record VariantResponse(Long id, String label, BigDecimal price, int stock, boolean active) {}
