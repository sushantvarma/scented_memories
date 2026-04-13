package com.scentedmemories.product.repository;

import com.scentedmemories.product.entity.ProductVariant;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    /**
     * Fetch all active variants for a product, ordered by price ascending.
     * Used by the product detail page to avoid cartesian product with tags.
     */
    List<ProductVariant> findByProductIdOrderByPriceAsc(Long productId);

    /**
     * Acquires a pessimistic write lock on the variant row.
     * Used during order placement to prevent concurrent overselling (EC-1).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM ProductVariant v WHERE v.id = :id")
    Optional<ProductVariant> findByIdWithLock(@Param("id") Long id);
}
