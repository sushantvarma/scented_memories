-- =============================================================================
-- V1__create_schema.sql
-- ScentedMemories — full schema creation
-- All tables, constraints, foreign keys, and indexes.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. CATEGORIES
-- -----------------------------------------------------------------------------
CREATE TABLE categories (
    id          BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) NOT NULL,   -- URL-safe identifier, e.g. "essential-oils"
    description TEXT,

    CONSTRAINT uq_categories_slug UNIQUE (slug)
);

-- -----------------------------------------------------------------------------
-- 2. TAGS
-- Dimension enum: SCENT | MOOD | USE_CASE
-- -----------------------------------------------------------------------------
CREATE TABLE tags (
    id        BIGSERIAL   PRIMARY KEY,
    name      VARCHAR(100) NOT NULL,
    dimension VARCHAR(20)  NOT NULL,

    CONSTRAINT chk_tags_dimension CHECK (dimension IN ('SCENT', 'MOOD', 'USE_CASE')),
    CONSTRAINT uq_tags_name_dimension UNIQUE (name, dimension)
);

-- -----------------------------------------------------------------------------
-- 3. PRODUCTS
-- slug: SEO-friendly URL segment. UNIQUE constraint creates its own B-tree index.
-- active: soft-delete flag. Products are never hard-deleted.
-- -----------------------------------------------------------------------------
CREATE TABLE products (
    id          BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    slug        VARCHAR(255) NOT NULL,   -- e.g. "lavender-aroma-oil"
    category_id BIGINT       NOT NULL,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_products_slug     UNIQUE (slug),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id)
        REFERENCES categories (id)
        -- Deletion blocked at service layer (CategoryNotEmptyException) before reaching DB
);

-- -----------------------------------------------------------------------------
-- 4. PRODUCT IMAGES
-- position: explicit ordering, no default — caller must supply.
-- UNIQUE (product_id, position) prevents silent position collisions.
-- -----------------------------------------------------------------------------
CREATE TABLE product_images (
    id         BIGSERIAL PRIMARY KEY,
    product_id BIGINT    NOT NULL,
    url        TEXT      NOT NULL,
    position   INT       NOT NULL,   -- no DEFAULT; must be supplied explicitly

    CONSTRAINT uq_product_images_position UNIQUE (product_id, position),
    CONSTRAINT fk_product_images_product  FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 5. PRODUCT VARIANTS
-- active: independent of parent product's active flag.
-- price: >= 0 enforced by CHECK.
-- stock: >= 0 enforced by CHECK; decremented with pessimistic lock during orders.
-- UNIQUE (product_id, label) prevents duplicate variant labels per product.
-- -----------------------------------------------------------------------------
CREATE TABLE product_variants (
    id         BIGSERIAL      PRIMARY KEY,
    product_id BIGINT         NOT NULL,
    label      VARCHAR(100)   NOT NULL,   -- e.g. "10ml", "30ml", "Pack of 6"
    price      NUMERIC(10, 2) NOT NULL,
    stock      INT            NOT NULL DEFAULT 0,
    active     BOOLEAN        NOT NULL DEFAULT TRUE,

    CONSTRAINT chk_product_variants_price CHECK (price >= 0),
    CONSTRAINT chk_product_variants_stock CHECK (stock >= 0),
    CONSTRAINT uq_product_variants_label  UNIQUE (product_id, label),
    CONSTRAINT fk_product_variants_product FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 6. PRODUCT ↔ TAG ASSOCIATION
-- Composite PK prevents duplicate assignments.
-- Idempotent insert handled at service layer (ON CONFLICT DO NOTHING).
-- -----------------------------------------------------------------------------
CREATE TABLE product_tags (
    product_id BIGINT NOT NULL,
    tag_id     BIGINT NOT NULL,

    CONSTRAINT pk_product_tags PRIMARY KEY (product_id, tag_id),
    CONSTRAINT fk_product_tags_product FOREIGN KEY (product_id)
        REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT fk_product_tags_tag FOREIGN KEY (tag_id)
        REFERENCES tags (id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 7. USERS
-- password_hash: bcrypt, cost factor >= 10. Never store plaintext.
-- role: CUSTOMER (default) or ADMIN.
-- email: unique enforced at DB level; format validated at application layer.
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id            BIGSERIAL    PRIMARY KEY,
    full_name     VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'CUSTOMER',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_role CHECK (role IN ('CUSTOMER', 'ADMIN'))
);

-- -----------------------------------------------------------------------------
-- 8. ORDERS
-- user_id: nullable — guest orders have no associated user.
-- total_amount: > 0, computed server-side only, never from client input.
-- status: enforced transition graph in OrderService.
-- -----------------------------------------------------------------------------
CREATE TABLE orders (
    id               BIGSERIAL      PRIMARY KEY,
    user_id          BIGINT,                        -- NULL for guest orders
    customer_name    VARCHAR(255)   NOT NULL,
    customer_email   VARCHAR(255)   NOT NULL,
    customer_phone   VARCHAR(50),
    shipping_street  TEXT           NOT NULL,
    shipping_city    VARCHAR(100)   NOT NULL,
    shipping_state   VARCHAR(100)   NOT NULL,
    shipping_postal  VARCHAR(20)    NOT NULL,
    shipping_country VARCHAR(100)   NOT NULL DEFAULT 'India',
    status           VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    total_amount     NUMERIC(10, 2) NOT NULL,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_orders_total  CHECK (total_amount > 0),
    CONSTRAINT chk_orders_status CHECK (status IN ('PENDING','PROCESSING','SHIPPED','FULFILLED','CANCELLED')),
    CONSTRAINT fk_orders_user    FOREIGN KEY (user_id)
        REFERENCES users (id)
        -- user_id set to NULL for guests; no cascade needed
);

-- -----------------------------------------------------------------------------
-- 9. ORDER ITEMS
-- Snapshots (variant_label_snap, product_name_snap, unit_price_snap) are
-- captured at order creation time from the DB — never from client input.
-- UNIQUE (order_id, variant_id) prevents duplicate line items per order.
-- -----------------------------------------------------------------------------
CREATE TABLE order_items (
    id                 BIGSERIAL      PRIMARY KEY,
    order_id           BIGINT         NOT NULL,
    variant_id         BIGINT         NOT NULL,
    variant_label_snap VARCHAR(100)   NOT NULL,   -- snapshot: preserved if variant renamed
    product_name_snap  VARCHAR(255)   NOT NULL,   -- snapshot: preserved if product renamed
    unit_price_snap    NUMERIC(10, 2) NOT NULL,   -- snapshot: DB price at order time
    quantity           INT            NOT NULL,

    CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
    CONSTRAINT uq_order_items_variant   UNIQUE (order_id, variant_id),
    CONSTRAINT fk_order_items_order     FOREIGN KEY (order_id)
        REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_variant   FOREIGN KEY (variant_id)
        REFERENCES product_variants (id)
        -- No cascade: variant soft-deactivated, not deleted; order history preserved
);

-- =============================================================================
-- INDEXES
-- Only indexes with clear query-pattern justification at MVP scale.
-- =============================================================================

-- Products filtered by category (most common listing query)
-- Partial index: only active products — matches the WHERE active = TRUE filter
CREATE INDEX idx_products_category
    ON products (category_id)
    WHERE active = TRUE;

-- Variants looked up by product (product detail page, order placement)
CREATE INDEX idx_variants_product
    ON product_variants (product_id);

-- Tag filter: find all products with a given tag
CREATE INDEX idx_product_tags_tag
    ON product_tags (tag_id);

-- Order lookup by user (authenticated order history)
CREATE INDEX idx_orders_user
    ON orders (user_id);

-- Admin order list sorted by newest first
CREATE INDEX idx_orders_created
    ON orders (created_at DESC);

-- NOTE: idx_orders_status intentionally omitted.
-- Low cardinality (5 values) at MVP scale (<10k orders) — seq scan is faster.
-- Add post-MVP if admin status filtering degrades.

-- NOTE: products.slug has no separate index.
-- The UNIQUE constraint (uq_products_slug) automatically creates a B-tree index.
