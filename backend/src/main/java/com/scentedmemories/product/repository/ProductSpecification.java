package com.scentedmemories.product.repository;

import com.scentedmemories.product.dto.ProductFilterParams;
import com.scentedmemories.product.entity.Product;
import com.scentedmemories.product.entity.ProductVariant;
import com.scentedmemories.product.entity.Tag;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * Builds a JPA Specification for the product listing query.
 *
 * Filters applied (all AND logic across types, per design):
 *   - active = true  (always)
 *   - categoryId     (exact match)
 *   - tagIds         (product must have ALL requested tags — one EXISTS per tag)
 *   - minPrice       (at least one active variant with price >= minPrice)
 *   - maxPrice       (at least one active variant with price <= maxPrice)
 *   - search         (case-insensitive LIKE on name OR description)
 */
public class ProductSpecification {

    private ProductSpecification() {}

    public static Specification<Product> from(ProductFilterParams f) {
        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            // Always filter to active products only
            predicates.add(cb.isTrue(root.get("active")));

            // ── Category filter ───────────────────────────────────────────
            if (f.categoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), f.categoryId()));
            }

            // ── Tag filter (AND logic: product must have ALL requested tags)
            if (!CollectionUtils.isEmpty(f.tagIds())) {
                for (Long tagId : f.tagIds()) {
                    // EXISTS (SELECT 1 FROM product_tags pt WHERE pt.product_id = p.id AND pt.tag_id = :tagId)
                    Subquery<Long> tagSubquery = query.subquery(Long.class);
                    Root<Product> tagRoot = tagSubquery.correlate(root);
                    Join<Product, Tag> tagJoin = tagRoot.join("tags");
                    tagSubquery.select(cb.literal(1L))
                               .where(cb.equal(tagJoin.get("id"), tagId));
                    predicates.add(cb.exists(tagSubquery));
                }
            }

            // ── Price range filter (at least one active variant in range) ─
            if (f.minPrice() != null || f.maxPrice() != null) {
                Subquery<Long> priceSubquery = query.subquery(Long.class);
                Root<ProductVariant> variantRoot = priceSubquery.from(ProductVariant.class);
                List<Predicate> variantPredicates = new ArrayList<>();

                variantPredicates.add(cb.equal(variantRoot.get("product"), root));
                variantPredicates.add(cb.isTrue(variantRoot.get("active")));

                if (f.minPrice() != null) {
                    variantPredicates.add(cb.greaterThanOrEqualTo(variantRoot.get("price"), f.minPrice()));
                }
                if (f.maxPrice() != null) {
                    variantPredicates.add(cb.lessThanOrEqualTo(variantRoot.get("price"), f.maxPrice()));
                }

                priceSubquery.select(cb.literal(1L))
                             .where(variantPredicates.toArray(new Predicate[0]));
                predicates.add(cb.exists(priceSubquery));
            }

            // ── Search filter ─────────────────────────────────────────────
            // nameOnly=true  → match name only (used by admin product search)
            // nameOnly=false → match name OR description (used by public storefront)
            if (StringUtils.hasText(f.search())) {
                String pattern = "%" + f.search().toLowerCase() + "%";
                if (f.nameOnly()) {
                    predicates.add(cb.like(cb.lower(root.get("name")), pattern));
                } else {
                    predicates.add(cb.or(
                            cb.like(cb.lower(root.get("name")), pattern),
                            cb.like(cb.lower(root.get("description")), pattern)
                    ));
                }
            }

            // Avoid duplicate rows from joins when using COUNT for pagination
            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
