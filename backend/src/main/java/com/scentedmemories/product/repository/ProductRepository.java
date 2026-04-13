package com.scentedmemories.product.repository;

import com.scentedmemories.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * JpaSpecificationExecutor enables dynamic filter queries via Specification (Criteria API).
 * Used by ProductService to compose category + tag + price + search filters.
 */
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    /**
     * Fetch product detail with all associations in two queries (fetch join + separate
     * collection fetches) to avoid the Hibernate "HHH90003004" cartesian product warning.
     * Used by GET /api/products/{slug}.
     */
    @Query("""
            SELECT DISTINCT p FROM Product p
            LEFT JOIN FETCH p.category
            LEFT JOIN FETCH p.tags
            WHERE p.slug = :slug AND p.active = true
            """)
    Optional<Product> findDetailBySlug(@Param("slug") String slug);

    /**
     * Lightweight lookup — used internally when only the product entity is needed
     * without eagerly loading all collections.
     */
    Optional<Product> findBySlugAndActiveTrue(String slug);

    boolean existsBySlug(String slug);

    long countByCategoryId(Long categoryId);
}
