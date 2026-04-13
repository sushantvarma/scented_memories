package com.scentedmemories.order.repository;

import com.scentedmemories.order.entity.Order;
import com.scentedmemories.order.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    /** Used by admin order list — paginated, optionally filtered by status. */
    Page<Order> findAllByStatus(OrderStatus status, Pageable pageable);

    /** Used to verify ownership: authenticated user can only access their own orders. */
    Optional<Order> findByIdAndUserId(Long id, Long userId);
}
