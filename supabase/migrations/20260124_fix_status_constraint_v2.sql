-- Add 'return_requested' to status check constraint
ALTER TABLE store_orders DROP CONSTRAINT IF EXISTS store_orders_status_check;
ALTER TABLE store_orders ADD CONSTRAINT store_orders_status_check 
CHECK (status IN ('pending', 'received', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'return_requested'));
