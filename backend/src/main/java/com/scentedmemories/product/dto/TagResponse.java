package com.scentedmemories.product.dto;

import com.scentedmemories.product.entity.TagDimension;

public record TagResponse(Long id, String name, TagDimension dimension) {}
