package com.scentedmemories.product.service;

import com.scentedmemories.common.exception.EntityNotFoundException;
import com.scentedmemories.product.dto.*;
import com.scentedmemories.product.entity.*;
import com.scentedmemories.product.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;

    public ProductServiceImpl(
            ProductRepository productRepository,
            ProductVariantRepository variantRepository,
            CategoryRepository categoryRepository,
            TagRepository tagRepository
    ) {
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
    }

    // ── Public: product listing ───────────────────────────────────────────────

    @Override
    public Page<ProductSummaryResponse> listProducts(ProductFilterParams filters, Pageable pageable) {
        Specification<Product> spec = ProductSpecification.from(filters);
        return productRepository.findAll(spec, pageable)
                .map(this::toSummaryResponse);
    }

    // ── Public: product detail ────────────────────────────────────────────────

    @Override
    public ProductDetailResponse getProductBySlug(String slug) {
        // Fetch product with category + tags in one query; variants loaded separately
        Product product = productRepository.findDetailBySlug(slug)
                .orElseThrow(() -> new EntityNotFoundException("Product not found: " + slug));

        // Load variants separately to avoid cartesian product with tags
        List<ProductVariant> variants = variantRepository.findByProductIdOrderByPriceAsc(product.getId());

        return toDetailResponse(product, variants);
    }

    // ── Admin: product CRUD ───────────────────────────────────────────────────

    @Override
    @Transactional
    public ProductDetailResponse createProduct(CreateProductRequest request) {
        throw new UnsupportedOperationException("Not yet implemented");
    }

    @Override
    @Transactional
    public ProductDetailResponse updateProduct(Long id, CreateProductRequest request) {
        throw new UnsupportedOperationException("Not yet implemented");
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found: " + id));
        product.setActive(false);
        productRepository.save(product);
    }

    @Override
    @Transactional
    public VariantResponse updateVariantStock(Long productId, Long variantId, int stock) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new EntityNotFoundException("Variant not found: " + variantId));
        if (!variant.getProduct().getId().equals(productId)) {
            throw new EntityNotFoundException(
                    "Variant " + variantId + " does not belong to product " + productId);
        }
        variant.setStock(stock);
        return toVariantResponse(variantRepository.save(variant));
    }

    // ── Public: reference data ────────────────────────────────────────────────

    @Override
    public List<CategoryResponse> listCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName(), c.getSlug(), c.getDescription()))
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, List<TagResponse>> listTagsByDimension() {
        return tagRepository.findAll().stream()
                .map(t -> new TagResponse(t.getId(), t.getName(), t.getDimension()))
                .collect(Collectors.groupingBy(tr -> tr.dimension().name()));
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    /**
     * Summary response for the listing page.
     * startingPrice = lowest price among active variants (null if no active variants).
     * primaryImageUrl = image at position 0 (null if no images).
     */
    private ProductSummaryResponse toSummaryResponse(Product p) {
        BigDecimal startingPrice = p.getVariants().stream()
                .filter(ProductVariant::isActive)
                .map(ProductVariant::getPrice)
                .min(Comparator.naturalOrder())
                .orElse(null);

        String primaryImageUrl = p.getImages().stream()
                .min(Comparator.comparingInt(ProductImage::getPosition))
                .map(ProductImage::getUrl)
                .orElse(null);

        CategoryResponse category = new CategoryResponse(
                p.getCategory().getId(), p.getCategory().getName(), p.getCategory().getSlug(),
                p.getCategory().getDescription());

        List<TagResponse> tags = p.getTags().stream()
                .map(t -> new TagResponse(t.getId(), t.getName(), t.getDimension()))
                .collect(Collectors.toList());

        return new ProductSummaryResponse(
                p.getId(), p.getSlug(), p.getName(),
                primaryImageUrl, startingPrice, category, tags);
    }

    /**
     * Full detail response for the product detail page.
     * Only active variants are returned to the customer.
     * Images are ordered by position (ascending).
     */
    private ProductDetailResponse toDetailResponse(Product p, List<ProductVariant> variants) {
        List<String> imageUrls = p.getImages().stream()
                .sorted(Comparator.comparingInt(ProductImage::getPosition))
                .map(ProductImage::getUrl)
                .collect(Collectors.toList());

        List<TagResponse> tags = p.getTags().stream()
                .map(t -> new TagResponse(t.getId(), t.getName(), t.getDimension()))
                .collect(Collectors.toList());

        List<VariantResponse> variantResponses = variants.stream()
                .filter(ProductVariant::isActive)
                .map(this::toVariantResponse)
                .collect(Collectors.toList());

        CategoryResponse category = new CategoryResponse(
                p.getCategory().getId(), p.getCategory().getName(), p.getCategory().getSlug(),
                p.getCategory().getDescription());

        return new ProductDetailResponse(
                p.getId(), p.getSlug(), p.getName(), p.getDescription(),
                imageUrls, category, tags, variantResponses, p.isActive());
    }

    private VariantResponse toVariantResponse(ProductVariant v) {
        return new VariantResponse(v.getId(), v.getLabel(), v.getPrice(), v.getStock(), v.isActive());
    }
}
