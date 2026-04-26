package com.scentedmemories.product.controller;

import com.scentedmemories.product.dto.*;
import com.scentedmemories.product.service.ProductService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/** Admin product management endpoints — ADMIN role required. */
@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
@Validated
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * GET /api/admin/products — list all products (including inactive) with name-only search.
     * Unlike the public endpoint, search matches product name only — not description.
     * This prevents "lavender" matching Eucalyptus because its description mentions lavender.
     */
    @GetMapping
    public ResponseEntity<Page<ProductSummaryResponse>> listProducts(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")  @Min(0)  int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(50) int size
    ) {
        ProductFilterParams filters = new ProductFilterParams(
                null, null, null, null, search, true  // nameOnly = true
        );
        return ResponseEntity.ok(
                productService.listProductsWithStock(filters, PageRequest.of(page, size,
                        Sort.by("name").ascending()))
        );
    }

    /** GET /api/admin/products/{id} — fetch full product detail for edit form */
    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponse> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    /** POST /api/admin/products */
    @PostMapping
    public ResponseEntity<ProductDetailResponse> createProduct(@Valid @RequestBody CreateProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(request));
    }

    /** PUT /api/admin/products/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<ProductDetailResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody CreateProductRequest request
    ) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    /** DELETE /api/admin/products/{id} — soft-delete only */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    /** PUT /api/admin/products/{productId}/variants/{variantId}/inventory */
    @PutMapping("/{productId}/variants/{variantId}/inventory")
    public ResponseEntity<VariantResponse> updateStock(
            @PathVariable Long productId,
            @PathVariable Long variantId,
            @Valid @RequestBody UpdateStockRequest request
    ) {
        return ResponseEntity.ok(productService.updateVariantStock(productId, variantId, request.stock()));
    }
}
