
-- Add return_requested column to store_order_items
ALTER TABLE store_order_items 
ADD COLUMN IF NOT EXISTS return_requested BOOLEAN DEFAULT FALSE;

-- Add return_reason column just in case
ALTER TABLE store_order_items 
ADD COLUMN IF NOT EXISTS return_reason TEXT;
