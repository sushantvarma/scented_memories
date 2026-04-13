-- =============================================================================
-- V2__seed_reference_data.sql
-- ScentedMemories — reference data: categories and tags
-- =============================================================================

-- -----------------------------------------------------------------------------
-- CATEGORIES
-- -----------------------------------------------------------------------------
INSERT INTO categories (name, slug, description) VALUES
    ('Essential Oils',   'essential-oils',   'Pure, undiluted essential oils for aromatherapy and wellness'),
    ('Aroma Oils',       'aroma-oils',       'Blended fragrance oils for diffusers and home use'),
    ('Incense',          'incense',          'Dhoop cones, incense sticks, and resin incense'),
    ('Rose Water',       'rose-water',       'Pure distilled rose water for skin care and culinary use'),
    ('Diffusers',        'diffusers',        'Electric and reed diffusers for continuous fragrance'),
    ('Fragrance Kits',   'fragrance-kits',   'Curated gift sets and starter kits');

-- -----------------------------------------------------------------------------
-- TAGS — SCENT dimension
-- -----------------------------------------------------------------------------
INSERT INTO tags (name, dimension) VALUES
    ('Lavender',     'SCENT'),
    ('Rose',         'SCENT'),
    ('Sandalwood',   'SCENT'),
    ('Jasmine',      'SCENT'),
    ('Eucalyptus',   'SCENT'),
    ('Peppermint',   'SCENT'),
    ('Lemongrass',   'SCENT'),
    ('Cedarwood',    'SCENT'),
    ('Ylang Ylang',  'SCENT'),
    ('Frankincense', 'SCENT');

-- -----------------------------------------------------------------------------
-- TAGS — MOOD dimension
-- -----------------------------------------------------------------------------
INSERT INTO tags (name, dimension) VALUES
    ('Calming',      'MOOD'),
    ('Energizing',   'MOOD'),
    ('Romantic',     'MOOD'),
    ('Uplifting',    'MOOD'),
    ('Grounding',    'MOOD'),
    ('Refreshing',   'MOOD'),
    ('Balancing',    'MOOD');

-- -----------------------------------------------------------------------------
-- TAGS — USE_CASE dimension
-- -----------------------------------------------------------------------------
INSERT INTO tags (name, dimension) VALUES
    ('Meditation',   'USE_CASE'),
    ('Sleep',        'USE_CASE'),
    ('Yoga',         'USE_CASE'),
    ('Home Decor',   'USE_CASE'),
    ('Skin Care',    'USE_CASE'),
    ('Stress Relief','USE_CASE'),
    ('Focus',        'USE_CASE'),
    ('Bath & Body',  'USE_CASE');
