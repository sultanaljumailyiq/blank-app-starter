-- Fix duplicate indexes on products table
-- Drop the redundant index (keep idx_products_supplier_id as it's more descriptive)

DROP INDEX IF EXISTS idx_products_supplier;

-- Also verify and clean up any other potential duplicates
