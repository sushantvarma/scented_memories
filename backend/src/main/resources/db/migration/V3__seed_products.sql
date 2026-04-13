-- =============================================================================
-- V3__seed_products.sql
-- ScentedMemories — 10 sample products with variants, images, and tags
--
-- Uses CTEs to resolve category/tag IDs by name — no hardcoded IDs.
-- All prices in INR.
-- =============================================================================

-- =============================================================================
-- PRODUCT 1: Lavender Essential Oil
-- =============================================================================
WITH p AS (
    INSERT INTO products (name, description, slug, category_id)
    SELECT
        'Lavender Essential Oil',
        'Pure steam-distilled lavender essential oil sourced from the fields of Uttarakhand. '
        'Known for its calming and sleep-promoting properties. Ideal for diffusers, bath blends, '
        'and topical use when diluted with a carrier oil.',
        'lavender-essential-oil',
        id
    FROM categories WHERE slug = 'essential-oils'
    RETURNING id
),
v1 AS (
    INSERT INTO product_variants (product_id, label, price, stock)
    SELECT id, '10ml', 349.00, 80 FROM p RETURNING id, product_id
),
v2 AS (
    INSERT INTO product_variants (product_id, label, price, stock)
    SELECT product_id, '30ml', 849.00, 45 FROM v1 RETURNING product_id
)
INSERT INTO product_images (product_id, url, position)
SELECT product_id, 'https://images.scentedmemories.in/products/lavender-essential-oil-1.jpg', 0 FROM v2
UNION ALL
SELECT product_id, 'https://images.scentedmemories.in/products/lavender-essential-oil-2.jpg', 1 FROM v2;

INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id FROM products p, tags t
WHERE p.slug = 'lavender-essential-oil'
  AND t.name IN ('Lavender', 'Calming', 'Sleep', 'Meditation', 'Stress Relief')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PRODUCT 2: Rose Aroma Oil
-- =============================================================================
WITH p AS (
    INSERT INTO products (name, description, slug, category_id)
    SELECT
        'Rose Aroma Oil',
        'A rich, floral rose aroma oil blended for use in electric and reed diffusers. '
        'Fills your space with the timeless scent of fresh roses. Perfect for creating a '
        'romantic and uplifting atmosphere at home.',
        'rose-aroma-oil',
        id
    FROM categories WHERE slug = 'aroma-oils'
    RETURNING id
),
v1 AS (
    INSERT INTO product_variants (product_id, label, price, stock)
    SELECT id, '15ml', 299.00, 60 FROM p RETURNING id, product_id
),
v2 AS (
    INSERT INTO product_variants (product_id, label, price, stock)
    SELECT product_id, '30ml', 549.00, 35 FROM v1 RETURNING product_id
)
INSERT INTO product_images (product_id, url, position)
SELECT product_id, 'https://images.scentedmemories.in/products/rose-aroma-oil-1.jpg', 0 FROM v2;

INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id FROM products p, tags t
WHERE p.slug = 'rose-aroma-oil'
  AND t.name IN ('Rose', 'Romantic', 'Uplifting', 'Home Decor')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PRODUCT 3: Sandalwood Dhoop Cones
-- =============================================================================
WITH p AS (
    INSERT INTO products (name, description, slug, category_id)
    SELECT
        'Sandalwood Dhoop Cones',
        'Hand-rolled sandalwood dhoop cones made with natural ingredients and no synthetic '
        'binders. Each cone burns for approximately 20 minutes, releasing a warm, woody '
        'fragrance that is deeply grounding and ideal for meditation and prayer.',
        'sandalwood-dhoop-cones',
        id
    FROM categories WHERE slug = 'incense'
    RETURNING id
),
v1 AS (
    INSERT INTO product_variants (product_id, label, price, stock)
    SELECT id, 'Pack of 12', 199.00, 120 FROM p RETURNING id, product_id
),
v2 AS (
    INSERT INTO product_variants (product_id, label, price, stock)
    SELECT product_id, 'Pack of 30', 449.00, 75 FROM v1 RETURNING product_id
)
INSERT INTO product_images (product_id, url, position)
SELECT product_id, 'https://images.scentedmemories.in/products/sandalwood-dhoop-cones-1.jpg', 0 FROM v2
UNION ALL
SELECT product_id, 'https://images.scentedmemories.in/products/sandalwood-dhoop-cones-2.jpg', 1 FROM v2;

INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id FROM products p, tags t
WHERE p.slug = 'sandalwood-dhoop-cones'
  AND t.name IN ('Sandalwood', 'Grounding', 'Meditation', 'Yoga')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PRODUCT 4: Pure Rose Water
-- =============================================================================
WITH p AS (
    INSERT INTO products (name, description, slug, category_id)
    SELECT
        'Pure Rose Water',
        'Steam-distilled pure rose water with no added alcohol or preservatives. '
        'Suitable for use as a facial toner, in cooking, and as a natural room freshener. '
        'Sourced from Kannauj, India — the perfume capital of the East.',
        'pure-rose-water',
        id
    FROM categories WHERE slug = 'rose-water'
    RETURNING id
),
v1 AS (
    INSERT INTO product_variants (product_id, label, price, stock)
    SELECT id, '100ml', 249.00, 90 FROM p RETURNING id, product_id
),
v2 AS (
    INSERT INTO product_variants (product_id, label, price, stock)
    SELECT product_id, '200ml', 449.00, 55 FROM v1 RETURNING product_id
)
INSERT INTO product_images (product_id, url, position)
SELECT product_id, 'https://images.scentedmemories.in/products/pure-rose-water-1.jpg', 0 FROM v2
UNION ALL
SELECT product_id, 'https://images.scentedmemories.in/products/pure-rose-water-2.jpg', 1 FROM v2;

INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id FROM products p, tags t
WHERE p.slug = 'pure-rose-water'
  AND t.name IN ('Rose', 'Skin Care', 'Bath & Body', 'Refreshing')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PRODUCT 5: Eucalyptus Essential Oil
-- =============================================================================
WITH p AS (
    INSERT INTO products (name, description, slug, category_id)
    SELECT
        'Eucalyptus Essential Oil',
        'Cold-pressed eucalyptus essential oil with a sharp, clean, camphoraceous aroma. '
        'Widely used for respiratory support, steam inhalation, and as a natural insect repellent. '
        'Blends well with peppermint and lavender.',
        'eucalyptus-essential-oil',
        id
    FROM categories WHERE slug = 'essential-oils'
    RETURNING id
),
v1 AS (
    INSERT INTO product_variants (product_id, label, price, stock)
    SELECT id, '10ml', 299.00, 70 FROM p RETURNING id, product_id
),
v2 AS (
    INSERT INTO product_variants (product_id, label, price, stock)
    SELECT product_id, '30ml', 749.00, 30 FROM v1 RETURNING product_id
)
INSERT INTO product_images (product_id, url, position)
SELECT product_id, 'https://images.scentedmemories.in/products/eucalyptus-essential-oil-1.jpg', 0 FROM v2;

INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id FROM products p, tags t
WHERE p.slug = 'eucalyptus-essential-oil'
  AND t.name IN ('Eucalyptus', 'Refreshing', 'Energizing', 'Focus', 'Stress Relief')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PRODUCT 6: Jasmine Incense Sticks
-- =============================================================================
WITH p AS (
    INSERT INTO products (name, description, slug, category_id)
    SELECT
        'Jasmine Incense Sticks',
        'Premium masala incense sticks hand-rolled with natural jasmine extract and '
        'sandalwood powder. Each stick burns for 45–50 minutes. Free from charcoal and '
        'synthetic fragrances. A classic choice for daily puja and relaxation.',
        'jasmine-incense-sticks',
        id
    FROM categories WHERE slug = 'incense'
    RETURNING id
),
v1 AS (
    INSERT INTO product_variants (product_id, label, price, stock)
    SELECT id, 'Pack of 20', 149.00, 150 FROM p RETURNING id, product_id
),
v2 AS (
    INSERT INTO product_variants (product_id, label, price, stock)
    SELECT product_id, 'Pack of 50', 329.00, 80 FROM v1 RETURNING product_id
),
v3 AS (
    INSERT INTO product_variants (product_id, label, price, stock)
    SELECT product_id, 'Pack of 100', 599.00, 40 FROM v2 RETURNING product_id
)
INSERT INTO product_images (product_id, url, position)
SELECT product_id, 'https://images.scentedmemories.in/products/jasmine-incense-sticks-1.jpg', 0 FROM v3
UNION ALL
SELECT product_id, 'https://images.scentedmemories.in/products/jasmine-incense-sticks-2.jpg', 1 FROM v3;

INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id FROM products p, tags t
WHERE p.slug = 'jasmine-incense-sticks'
  AND t.name IN ('Jasmine', 'Calming', 'Romantic', 'Meditation', 'Home Decor')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PRODUCT 7: Ultrasonic Aroma Diffuser
-- =============================================================================
WITH p AS (
    INSERT INTO products (name, description, slug, category_id)
    SELECT
        'Ultrasonic Aroma Diffuser',
        'Whisper-quiet ultrasonic diffuser with 7-colour LED mood lighting and auto shut-off. '
        '300ml water capacity provides up to 8 hours of continuous misting. '
        'Compatible with all water-soluble aroma and essential oils. '
        'Ideal for bedrooms, living rooms, and yoga studios.',
        'ultrasonic-aroma-diffuser',
        id
    FROM categories WHERE slug = 'diffusers'
    RETURNING id
),
v1 AS (
    INSERT INTO product_variants (product_id, label, price, stock)
    SELECT id, 'White', 1299.00, 25 FROM p RETURNING id, product_id
),
v2 AS (
    INSERT INTO product_variants (product_id, label, price, stock)
    SELECT product_id, 'Walnut Wood', 1599.00, 15 FROM v1 RETURNING product_id
)
INSERT INTO product_images (product_id, url, position)
SELECT product_id, 'https://images.scentedmemories.in/products/ultrasonic-diffuser-1.jpg', 0 FROM v2
UNION ALL
SELECT product_id, 'https://images.scentedmemories.in/products/ultrasonic-diffuser-2.jpg', 1 FROM v2
UNION ALL
SELECT product_id, 'https://images.scentedmemories.in/products/ultrasonic-diffuser-3.jpg', 2 FROM v2;

INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id FROM products p, tags t
WHERE p.slug = 'ultrasonic-aroma-diffuser'
  AND t.name IN ('Home Decor', 'Calming', 'Sleep', 'Meditation', 'Yoga')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PRODUCT 8: Lemongrass Aroma Oil
-- =============================================================================
WITH p AS (
    INSERT INTO products (name, description, slug, category_id)
    SELECT
        'Lemongrass Aroma Oil',
        'Bright, citrusy lemongrass aroma oil that instantly refreshes and energises any space. '
        'A natural insect repellent when used in a diffuser. Blends beautifully with eucalyptus '
        'and peppermint for an invigorating morning routine.',
        'lemongrass-aroma-oil',
        id
    FROM categories WHERE slug = 'aroma-oils'
    RETURNING id
),
v1 AS (
    INSERT INTO product_variants (product_id, label, price, stock)
    SELECT id, '15ml', 249.00, 85 FROM p RETURNING id, product_id
),
v2 AS (
    INSERT INTO product_variants (product_id, label, price, stock)
    SELECT product_id, '30ml', 449.00, 50 FROM v1 RETURNING product_id
)
INSERT INTO product_images (product_id, url, position)
SELECT product_id, 'https://images.scentedmemories.in/products/lemongrass-aroma-oil-1.jpg', 0 FROM v2;

INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id FROM products p, tags t
WHERE p.slug = 'lemongrass-aroma-oil'
  AND t.name IN ('Lemongrass', 'Energizing', 'Refreshing', 'Focus', 'Home Decor')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PRODUCT 9: Calm & Sleep Fragrance Kit
-- =============================================================================
WITH p AS (
    INSERT INTO products (name, description, slug, category_id)
    SELECT
        'Calm & Sleep Fragrance Kit',
        'A curated sleep ritual kit containing: 10ml Lavender Essential Oil, '
        '10ml Cedarwood Essential Oil, 12 Sandalwood Dhoop Cones, and a 100ml '
        'Rose Water facial mist. Everything you need to wind down and prepare for '
        'a restful night. Presented in a kraft gift box — perfect for gifting.',
        'calm-sleep-fragrance-kit',
        id
    FROM categories WHERE slug = 'fragrance-kits'
    RETURNING id
),
v1 AS (
    INSERT INTO product_variants (product_id, label, price, stock)
    SELECT id, 'Standard Kit', 999.00, 30 FROM p RETURNING id, product_id
),
v2 AS (
    INSERT INTO product_variants (product_id, label, price, stock)
    SELECT product_id, 'Premium Kit (with diffuser)', 2199.00, 12 FROM v1 RETURNING product_id
)
INSERT INTO product_images (product_id, url, position)
SELECT product_id, 'https://images.scentedmemories.in/products/calm-sleep-kit-1.jpg', 0 FROM v2
UNION ALL
SELECT product_id, 'https://images.scentedmemories.in/products/calm-sleep-kit-2.jpg', 1 FROM v2
UNION ALL
SELECT product_id, 'https://images.scentedmemories.in/products/calm-sleep-kit-3.jpg', 2 FROM v2;

INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id FROM products p, tags t
WHERE p.slug = 'calm-sleep-fragrance-kit'
  AND t.name IN ('Lavender', 'Cedarwood', 'Calming', 'Sleep', 'Stress Relief', 'Meditation')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- PRODUCT 10: Peppermint Essential Oil
-- =============================================================================
WITH p AS (
    INSERT INTO products (name, description, slug, category_id)
    SELECT
        'Peppermint Essential Oil',
        'Steam-distilled peppermint essential oil with a sharp, cooling menthol aroma. '
        'Used for headache relief, mental clarity, and as a natural energiser. '
        'Add 2–3 drops to a diffuser for an instant focus boost, or dilute in a carrier '
        'oil for a soothing scalp massage.',
        'peppermint-essential-oil',
        id
    FROM categories WHERE slug = 'essential-oils'
    RETURNING id
),
v1 AS (
    INSERT INTO product_variants (product_id, label, price, stock)
    SELECT id, '10ml', 279.00, 95 FROM p RETURNING id, product_id
),
v2 AS (
    INSERT INTO product_variants (product_id, label, price, stock)
    SELECT product_id, '30ml', 699.00, 40 FROM v1 RETURNING product_id
)
INSERT INTO product_images (product_id, url, position)
SELECT product_id, 'https://images.scentedmemories.in/products/peppermint-essential-oil-1.jpg', 0 FROM v2
UNION ALL
SELECT product_id, 'https://images.scentedmemories.in/products/peppermint-essential-oil-2.jpg', 1 FROM v2;

INSERT INTO product_tags (product_id, tag_id)
SELECT p.id, t.id FROM products p, tags t
WHERE p.slug = 'peppermint-essential-oil'
  AND t.name IN ('Peppermint', 'Energizing', 'Refreshing', 'Focus', 'Stress Relief')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- ADMIN USER SEED
-- Password: Admin@123 (bcrypt hash, cost 12)
-- Change this password immediately after first deployment.
-- =============================================================================
INSERT INTO users (full_name, email, password_hash, role)
VALUES (
    'ScentedMemories Admin',
    'admin@scentedmemories.in',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i',
    'ADMIN'
)
ON CONFLICT (email) DO NOTHING;
