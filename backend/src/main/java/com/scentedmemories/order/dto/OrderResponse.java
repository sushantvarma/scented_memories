package com.scentedmemories.order.dto;

import com.scentedmemories.order.entity.OrderStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String customerName,
        String customerEmail,
        String customerPhone,
        ShippingAddressRequest shippingAddress,
        OrderStatus status,
        BigDecimal totalAmount,
        List<OrderItemResponse> items,
        OffsetDateTime createdAt
) {}
