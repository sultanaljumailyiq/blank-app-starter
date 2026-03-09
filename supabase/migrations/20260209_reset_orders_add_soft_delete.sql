-- Clear all orders and items
TRUNCATE TABLE store_order_items CASCADE;
TRUNCATE TABLE store_orders CASCADE;

-- Add Soft Delete Columns
ALTER TABLE store_orders 
ADD COLUMN IF NOT EXISTS deleted_by_supplier BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_by_customer BOOLEAN DEFAULT FALSE;

-- Update RLS to filter out soft-deleted orders
DROP POLICY IF EXISTS "Suppliers view their own orders" ON store_orders;
CREATE POLICY "Suppliers view their own orders"
ON store_orders FOR SELECT
TO authenticated
USING (supplier_id = auth.uid() AND deleted_by_supplier = false);

DROP POLICY IF EXISTS "Users can view their own orders" ON store_orders;
CREATE POLICY "Users can view their own orders"
ON store_orders FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND deleted_by_customer = false);
