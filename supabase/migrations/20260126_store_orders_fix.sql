ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS user_name TEXT; -- logic in useStore uses it
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id); -- logic uses it
