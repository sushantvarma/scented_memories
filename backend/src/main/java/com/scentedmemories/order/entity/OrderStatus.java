package com.scentedmemories.order.entity;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

public enum OrderStatus {
    PENDING,
    PROCESSING,
    SHIPPED,
    FULFILLED,
    CANCELLED;

    /** Valid forward transitions. FULFILLED and CANCELLED are terminal. */
    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = Map.of(
            PENDING,    EnumSet.of(PROCESSING, CANCELLED),
            PROCESSING, EnumSet.of(SHIPPED, CANCELLED),
            SHIPPED,    EnumSet.of(FULFILLED),
            FULFILLED,  EnumSet.noneOf(OrderStatus.class),
            CANCELLED,  EnumSet.noneOf(OrderStatus.class)
    );

    public boolean canTransitionTo(OrderStatus next) {
        return ALLOWED_TRANSITIONS.getOrDefault(this, EnumSet.noneOf(OrderStatus.class)).contains(next);
    }
}
