package com.scentedmemories.product.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "product_images",
    uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "position"})
)
@Getter @Setter @NoArgsConstructor
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String url;

    /**
     * Explicit ordering position. No default — caller must supply.
     * UNIQUE on (product_id, position) prevents silent collisions.
     */
    @Column(nullable = false)
    private Integer position;
}
