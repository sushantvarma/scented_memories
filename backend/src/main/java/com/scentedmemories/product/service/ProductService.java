package com.scentedmemories.product.service;

import com.scentedmemories.product.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface ProductService {

    /** Public: paginated, filtered product listing. */
    Page<ProductSummaryResponse> listProducts(ProductFilterParams filters, Pageable pageable);

    /** Public: single product detail by slug. */
    ProductDetailResponse getProductBySlug(String slug);

    /** Admin: single product detail by ID (for edit form). */
    ProductDetailResponse getProductById(Long id);

    /** Admin: create product with variants and tags. */
    ProductDetailResponse createProduct(CreateProductRequest request);

    /** Admin: update product fields, variants, and tags. */
    ProductDetailResponse updateProduct(Long id, CreateProductRequest request);

    /** Admin: soft-delete (active = false). */
    void deleteProduct(Long id);

    /** Admin: update stock for a specific variant. */
    VariantResponse updateVariantStock(Long productId, Long variantId, int stock);

    /** Public: all categories. */
    List<CategoryResponse> listCategories();

    /** Public: all tags grouped by dimension. */
    Map<String, List<TagResponse>> listTagsByDimension();
}
