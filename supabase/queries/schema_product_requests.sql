
-- Update Products Table to support Requests
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured_request BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new_request BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS offer_request_percentage INTEGER DEFAULT 0; -- 0 means no offer request
ALTER TABLE products ADD COLUMN IF NOT EXISTS request_status TEXT DEFAULT 'none'; -- pending, approved, rejected

-- Update Featured Products to support pending status
-- (Already has status column, but making sure we use it for requests)
ALTER TABLE featured_products ALTER COLUMN status SET DEFAULT 'pending';

-- Add Policy for Suppliers to update their own product requests
CREATE POLICY "Suppliers can update their own products requests" ON products
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM suppliers WHERE id = products.supplier_id));
