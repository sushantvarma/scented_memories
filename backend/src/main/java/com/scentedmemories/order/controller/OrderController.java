package com.scentedmemories.order.controller;

import com.scentedmemories.order.dto.CreateOrderRequest;
import com.scentedmemories.order.dto.OrderResponse;
import com.scentedmemories.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /** POST /api/orders — public, JWT optional. */
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            Authentication auth
    ) {
        Long userId = auth != null ? (Long) auth.getPrincipal() : null;
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request, userId));
    }

    /** GET /api/orders/{id} — authenticated owner or ADMIN; guest orders: ADMIN only. */
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(
            @PathVariable Long id,
            Authentication auth
    ) {
        Long userId = (Long) auth.getPrincipal();
        boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        return ResponseEntity.ok(orderService.getOrder(id, userId, isAdmin));
    }
}
