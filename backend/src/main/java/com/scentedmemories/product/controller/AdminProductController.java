package com.scentedmemories.product.controller;

import com.scentedmemories.product.dto.*;
import com.scentedmemories.product.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Admin product management endpoints — ADMIN role required. */
@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(ProductService productService) {
        this.productService = productService;
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
