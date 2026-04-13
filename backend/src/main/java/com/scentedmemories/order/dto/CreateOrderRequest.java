package com.scentedmemories.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateOrderRequest(
        @NotBlank String customerName,
        @NotBlank @Email String customerEmail,
        String customerPhone,
        @NotNull @Valid ShippingAddressRequest shippingAddress,
        @NotEmpty @Valid List<OrderItemRequest> items
) {}
