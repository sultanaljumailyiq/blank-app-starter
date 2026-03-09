-- Allow suppliers to view items for their orders
DROP POLICY IF EXISTS "Suppliers view their order items" ON store_order_items;
CREATE POLICY "Suppliers view their order items"
ON store_order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM store_orders
    WHERE store_orders.id = store_order_items.order_id
    AND store_orders.supplier_id = auth.uid()
  )
);

-- Allow suppliers to update items status
DROP POLICY IF EXISTS "Suppliers update their order items" ON store_order_items;
CREATE POLICY "Suppliers update their order items"
ON store_order_items FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM store_orders
    WHERE store_orders.id = store_order_items.order_id
    AND store_orders.supplier_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM store_orders
    WHERE store_orders.id = store_order_items.order_id
    AND store_orders.supplier_id = auth.uid()
  )
);

-- Allow suppliers to DELETE their own orders (e.g. cancelled/rejected)
DROP POLICY IF EXISTS "Suppliers delete their own orders" ON store_orders;
CREATE POLICY "Suppliers delete their own orders"
ON store_orders FOR DELETE
TO authenticated
USING (supplier_id = auth.uid());
