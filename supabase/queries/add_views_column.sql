
-- Add views column to products if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Update existing rows to have 0 instead of null if needed (DEFAULT handles new ones)
UPDATE products SET views = 0 WHERE views IS NULL;
