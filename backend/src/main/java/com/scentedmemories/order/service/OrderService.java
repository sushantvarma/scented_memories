package com.scentedmemories.order.service;

import com.scentedmemories.order.dto.CreateOrderRequest;
import com.scentedmemories.order.dto.OrderResponse;
import com.scentedmemories.order.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {

    /**
     * Place a new order.
     * - Fetches current prices from DB (ignores any client-supplied prices).
     * - Acquires pessimistic lock on each variant before decrementing stock.
     * - Associates with userId if provided (authenticated), otherwise guest (user_id = NULL).
     */
    OrderResponse createOrder(CreateOrderRequest request, Long userId);

    /**
     * Get order by ID.
     * - Authenticated users: only their own orders (userId must match).
     * - ADMIN: any order (pass userId = null to bypass ownership check).
     * - Guest orders (user_id = NULL): ADMIN only.
     */
    OrderResponse getOrder(Long orderId, Long userId, boolean isAdmin);

    /** Admin: paginated order list, optionally filtered by status. */
    Page<OrderResponse> listOrders(OrderStatus statusFilter, Pageable pageable);

    /**
     * Admin: update order status.
     * Enforces valid transition graph — throws InvalidStatusTransitionException for invalid moves.
     */
    OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus);
}
