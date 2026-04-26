package com.scentedmemories.product.repository;

import com.scentedmemories.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
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

    @Query("""
            SELECT DISTINCT p FROM Product p
            LEFT JOIN FETCH p.category
            LEFT JOIN FETCH p.tags
            LEFT JOIN FETCH p.images
            WHERE p.id = :id
            """)
    Optional<Product> findDetailById(@Param("id") Long id);

    /**
     * Fetch the primary image (position = 0) for all products in a paginated result.
     * Used by the listing service to populate primaryImageUrl without N+1 queries.
     * Returns a list of [productId, imageUrl] pairs.
     */
    @Query("""
            SELECT pi.product.id, pi.url FROM ProductImage pi
            WHERE pi.product.id IN :productIds AND pi.position = 0
            """)
    List<Object[]> findPrimaryImageUrlsByProductIds(@Param("productIds") List<Long> productIds);

    /**
     * Sum of stock across all active variants, grouped by product.
     * Used by the admin product listing to show total inventory per product.
     * Returns a list of [productId, totalStock] pairs.
     */
    @Query("""
            SELECT v.product.id, SUM(v.stock) FROM ProductVariant v
            WHERE v.product.id IN :productIds AND v.active = true
            GROUP BY v.product.id
            """)
    List<Object[]> findTotalStockByProductIds(@Param("productIds") List<Long> productIds);

    /**
     * Lightweight lookup — used internally when only the product entity is needed
     * without eagerly loading all collections.
     */
    Optional<Product> findBySlugAndActiveTrue(String slug);

    boolean existsBySlug(String slug);

    long countByCategoryId(Long categoryId);
}
