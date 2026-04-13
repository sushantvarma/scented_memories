package com.scentedmemories.order.entity;

import com.scentedmemories.product.entity.ProductVariant;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(
    name = "order_items",
    uniqueConstraints = @UniqueConstraint(columnNames = {"order_id", "variant_id"})
)
@Getter @Setter @NoArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    /** Snapshot of variant label at order time — preserved if variant is later renamed. */
    @Column(name = "variant_label_snap", nullable = false, length = 100)
    private String variantLabelSnap;

    /** Snapshot of product name at order time — preserved if product is later renamed. */
    @Column(name = "product_name_snap", nullable = false)
    private String productNameSnap;

    /** Snapshot of price at order time — fetched from DB, never from client. */
    @Column(name = "unit_price_snap", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPriceSnap;

    @Column(nullable = false)
    private int quantity;
}
