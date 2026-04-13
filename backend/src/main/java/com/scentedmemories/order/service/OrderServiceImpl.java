package com.scentedmemories.order.service;

import com.scentedmemories.common.exception.EntityNotFoundException;
import com.scentedmemories.common.exception.InsufficientStockException;
import com.scentedmemories.common.exception.InvalidStatusTransitionException;
import com.scentedmemories.order.dto.*;
import com.scentedmemories.order.entity.Order;
import com.scentedmemories.order.entity.OrderItem;
import com.scentedmemories.order.entity.OrderStatus;
import com.scentedmemories.order.repository.OrderRepository;
import com.scentedmemories.product.entity.ProductVariant;
import com.scentedmemories.product.repository.ProductVariantRepository;
import com.scentedmemories.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;

    public OrderServiceImpl(
            OrderRepository orderRepository,
            ProductVariantRepository variantRepository,
            UserRepository userRepository
    ) {
        this.orderRepository = orderRepository;
        this.variantRepository = variantRepository;
        this.userRepository = userRepository;
    }

    @Override
    public OrderResponse createOrder(CreateOrderRequest request, Long userId) {
        Order order = new Order();
        order.setCustomerName(request.customerName());
        order.setCustomerEmail(request.customerEmail());
        order.setCustomerPhone(request.customerPhone());

        ShippingAddressRequest addr = request.shippingAddress();
        order.setShippingStreet(addr.street());
        order.setShippingCity(addr.city());
        order.setShippingState(addr.state());
        order.setShippingPostal(addr.postalCode());
        order.setShippingCountry(addr.country());

        // Associate with authenticated user if present; otherwise guest order
        if (userId != null) {
            userRepository.findById(userId).ifPresent(order::setUser);
        }

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.items()) {
            // Pessimistic lock — prevents concurrent overselling (EC-1)
            ProductVariant variant = variantRepository.findByIdWithLock(itemReq.variantId())
                    .orElseThrow(() -> new EntityNotFoundException("Variant not found: " + itemReq.variantId()));

            if (!variant.isActive()) {
                throw new InsufficientStockException("Variant is no longer available: " + variant.getLabel());
            }
            if (variant.getStock() < itemReq.quantity()) {
                throw new InsufficientStockException(
                        "Insufficient stock for variant: " + variant.getLabel() +
                        ". Available: " + variant.getStock() + ", requested: " + itemReq.quantity());
            }

            // Decrement stock
            variant.setStock(variant.getStock() - itemReq.quantity());
            variantRepository.save(variant);

            // Capture snapshots from DB — never from client
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setVariant(variant);
            item.setVariantLabelSnap(variant.getLabel());
            item.setProductNameSnap(variant.getProduct().getName());
            item.setUnitPriceSnap(variant.getPrice());  // DB price, not client price
            item.setQuantity(itemReq.quantity());

            orderItems.add(item);
            total = total.add(variant.getPrice().multiply(BigDecimal.valueOf(itemReq.quantity())));
        }

        order.setTotalAmount(total);
        order.setItems(orderItems);
        orderItems.forEach(i -> i.setOrder(order));

        Order saved = orderRepository.save(order);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long orderId, Long userId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + orderId));

        if (!isAdmin) {
            // Guest orders (user_id = NULL) are ADMIN-only
            if (order.getUser() == null) {
                throw new AccessDeniedException("Access denied");
            }
            // Authenticated user can only access their own orders
            if (!order.getUser().getId().equals(userId)) {
                throw new AccessDeniedException("Access denied");
            }
        }

        return toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> listOrders(OrderStatus statusFilter, Pageable pageable) {
        if (statusFilter != null) {
            return orderRepository.findAllByStatus(statusFilter, pageable).map(this::toResponse);
        }
        return orderRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found: " + orderId));

        if (!order.getStatus().canTransitionTo(newStatus)) {
            throw new InvalidStatusTransitionException(
                    "Cannot transition order from " + order.getStatus() + " to " + newStatus);
        }

        order.setStatus(newStatus);
        return toResponse(orderRepository.save(order));
    }

    // ── Mapper ───────────────────────────────────────────────────────────────

    private OrderResponse toResponse(Order o) {
        List<OrderItemResponse> items = o.getItems().stream()
                .map(i -> new OrderItemResponse(
                        i.getId(),
                        i.getVariant().getId(),
                        i.getProductNameSnap(),
                        i.getVariantLabelSnap(),
                        i.getUnitPriceSnap(),
                        i.getQuantity()))
                .collect(Collectors.toList());

        ShippingAddressRequest addr = new ShippingAddressRequest(
                o.getShippingStreet(), o.getShippingCity(),
                o.getShippingState(), o.getShippingPostal(), o.getShippingCountry());

        return new OrderResponse(
                o.getId(), o.getCustomerName(), o.getCustomerEmail(), o.getCustomerPhone(),
                addr, o.getStatus(), o.getTotalAmount(), items, o.getCreatedAt());
    }
}
