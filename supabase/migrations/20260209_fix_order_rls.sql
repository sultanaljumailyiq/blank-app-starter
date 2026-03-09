-- Enable RLS
ALTER TABLE store_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_order_items ENABLE ROW LEVEL SECURITY;

-- 1. Policies for store_orders

-- Allow users to create their own orders
DROP POLICY IF EXISTS "Users can create their own orders" ON store_orders;
CREATE POLICY "Users can create their own orders"
ON store_orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own orders
DROP POLICY IF EXISTS "Users can view their own orders" ON store_orders;
CREATE POLICY "Users can view their own orders"
ON store_orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow suppliers to view orders assigned to them
DROP POLICY IF EXISTS "Suppliers can view their assigned orders" ON store_orders;
CREATE POLICY "Suppliers can view their assigned orders"
ON store_orders FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM suppliers 
        WHERE id = store_orders.supplier_id 
        AND (user_id = auth.uid() OR profile_id = auth.uid())
    )
);

-- 2. Policies for store_order_items

-- Allow users to insert items into their own orders
-- We verify that the order belongs to the user
DROP POLICY IF EXISTS "Users can add items to their orders" ON store_order_items;
CREATE POLICY "Users can add items to their orders"
ON store_order_items FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM store_orders
        WHERE id = store_order_items.order_id
        AND user_id = auth.uid()
    )
);

-- Allow users to view items of their own orders
DROP POLICY IF EXISTS "Users can view items of their orders" ON store_order_items;
CREATE POLICY "Users can view items of their orders"
ON store_order_items FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM store_orders
        WHERE id = store_order_items.order_id
        AND user_id = auth.uid()
    )
);

-- Allow suppliers to view items of orders assigned to them
DROP POLICY IF EXISTS "Suppliers can view items of their orders" ON store_order_items;
CREATE POLICY "Suppliers can view items of their orders"
ON store_order_items FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM store_orders
        JOIN suppliers ON store_orders.supplier_id = suppliers.id
        WHERE store_orders.id = store_order_items.order_id
        AND (suppliers.user_id = auth.uid() OR suppliers.profile_id = auth.uid())
    )
);
