-- =============================================================================
-- V4__update_product_images.sql
-- Replace placeholder CDN image URLs with actual product images
-- served from the Next.js frontend /public directory.
--
-- Image filenames match product slugs exactly (URL-safe, hyphenated).
-- Products without a matching image (Rose Aroma Oil, Peppermint Essential Oil)
-- are left unchanged — they will show the placeholder ✦ icon in the UI.
-- Extra positions (1, 2) are removed since each product now has one real image.
-- =============================================================================

-- Lavender Essential Oil → /lavender-essential-oil.jpeg
UPDATE product_images
SET url = '/lavender-essential-oil.jpeg'
WHERE product_id = (SELECT id FROM products WHERE slug = 'lavender-essential-oil')
  AND position = 0;

DELETE FROM product_images
WHERE product_id = (SELECT id FROM products WHERE slug = 'lavender-essential-oil')
  AND position > 0;

-- Sandalwood Dhoop Cones → /sandalwood-dhoop-cones.jpeg
UPDATE product_images
SET url = '/sandalwood-dhoop-cones.jpeg'
WHERE product_id = (SELECT id FROM products WHERE slug = 'sandalwood-dhoop-cones')
  AND position = 0;

DELETE FROM product_images
WHERE product_id = (SELECT id FROM products WHERE slug = 'sandalwood-dhoop-cones')
  AND position > 0;

-- Pure Rose Water → /pure-rose-water.jpeg
UPDATE product_images
SET url = '/pure-rose-water.jpeg'
WHERE product_id = (SELECT id FROM products WHERE slug = 'pure-rose-water')
  AND position = 0;

DELETE FROM product_images
WHERE product_id = (SELECT id FROM products WHERE slug = 'pure-rose-water')
  AND position > 0;

-- Eucalyptus Essential Oil → /eucalyptus-essential-oil.jpeg
UPDATE product_images
SET url = '/eucalyptus-essential-oil.jpeg'
WHERE product_id = (SELECT id FROM products WHERE slug = 'eucalyptus-essential-oil')
  AND position = 0;

-- Jasmine Incense Sticks → /jasmine-incense-sticks.jpeg
UPDATE product_images
SET url = '/jasmine-incense-sticks.jpeg'
WHERE product_id = (SELECT id FROM products WHERE slug = 'jasmine-incense-sticks')
  AND position = 0;

DELETE FROM product_images
WHERE product_id = (SELECT id FROM products WHERE slug = 'jasmine-incense-sticks')
  AND position > 0;

-- Ultrasonic Aroma Diffuser → /ultrasonic-aroma-diffuser.jpeg
UPDATE product_images
SET url = '/ultrasonic-aroma-diffuser.jpeg'
WHERE product_id = (SELECT id FROM products WHERE slug = 'ultrasonic-aroma-diffuser')
  AND position = 0;

DELETE FROM product_images
WHERE product_id = (SELECT id FROM products WHERE slug = 'ultrasonic-aroma-diffuser')
  AND position > 0;

-- Lemongrass Aroma Oil → /lemongrass-aroma-oil.jpeg
UPDATE product_images
SET url = '/lemongrass-aroma-oil.jpeg'
WHERE product_id = (SELECT id FROM products WHERE slug = 'lemongrass-aroma-oil')
  AND position = 0;

-- Calm & Sleep Fragrance Kit → /calm-sleep-fragrance-kit.jpeg
UPDATE product_images
SET url = '/calm-sleep-fragrance-kit.jpeg'
WHERE product_id = (SELECT id FROM products WHERE slug = 'calm-sleep-fragrance-kit')
  AND position = 0;

DELETE FROM product_images
WHERE product_id = (SELECT id FROM products WHERE slug = 'calm-sleep-fragrance-kit')
  AND position > 0;
