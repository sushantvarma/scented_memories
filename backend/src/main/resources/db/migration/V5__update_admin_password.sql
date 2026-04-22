-- =============================================================================
-- V5__update_admin_password.sql
-- Update admin account password.
-- Hash: bcrypt cost 12 for "sushant123"
-- =============================================================================
UPDATE users
SET password_hash = '$2y$12$9Cds.d5W4KPa4rnRl2Zk2uT/VFqpARv26o3tOBvtDmvIQdtFVL5xW'
WHERE email = 'admin@scentedmemories.in';
