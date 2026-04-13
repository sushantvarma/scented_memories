package com.scentedmemories.product.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(
    name = "product_variants",
    uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "label"})
)
@Getter @Setter @NoArgsConstructor
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, length = 100)
    private String label;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    /**
     * Stock quantity. Non-negative enforced by DB CHECK and service layer.
     * Decremented with pessimistic lock (@Lock PESSIMISTIC_WRITE) during order placement.
     */
    @Column(nullable = false)
    private int stock = 0;

    /**
     * Independent of parent product's active flag.
     * Deactivating a variant hides only that variant, not the whole product.
     */
    @Column(nullable = false)
    private boolean active = true;
}
