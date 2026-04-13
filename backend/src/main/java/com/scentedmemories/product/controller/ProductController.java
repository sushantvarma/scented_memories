package com.scentedmemories.product.controller;

import com.scentedmemories.product.dto.*;
import com.scentedmemories.product.service.ProductService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Public product endpoints — no authentication required.
 * All responses are read-only; no state mutations here.
 */
@RestController
@RequestMapping("/api")
@Validated
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * GET /api/products
     *
     * Query params:
     *   categoryId  — filter by category ID
     *   tagIds      — multi-value, AND logic (product must have ALL tags)
     *   minPrice    — minimum variant price (INR)
     *   maxPrice    — maximum variant price (INR)
     *   search      — case-insensitive substring match on name or description
     *   page        — 0-based page index (default 0)
     *   size        — page size, max 50 (default 20)
     *   sort        — field,direction e.g. "name,asc" (default "createdAt,desc")
     */
    @GetMapping("/products")
    public ResponseEntity<Page<ProductSummaryResponse>> listProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) List<Long> tagIds,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")  @Min(0)  int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(50) int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        ProductFilterParams filters = new ProductFilterParams(categoryId, tagIds, minPrice, maxPrice, search);
        return ResponseEntity.ok(
                productService.listProducts(filters, PageRequest.of(page, size, sort)));
    }

    /**
     * GET /api/products/{slug}
     * Returns full product detail including all active variants and tags.
     * 404 if product not found or inactive.
     */
    @GetMapping("/products/{slug}")
    public ResponseEntity<ProductDetailResponse> getProduct(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getProductBySlug(slug));
    }

    /** GET /api/categories — all categories (used to populate filter sidebar). */
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> listCategories() {
        return ResponseEntity.ok(productService.listCategories());
    }

    /** GET /api/tags — all tags grouped by dimension (SCENT, MOOD, USE_CASE). */
    @GetMapping("/tags")
    public ResponseEntity<Map<String, List<TagResponse>>> listTags() {
        return ResponseEntity.ok(productService.listTagsByDimension());
    }
}
