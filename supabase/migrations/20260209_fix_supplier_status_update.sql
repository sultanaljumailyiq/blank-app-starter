-- Allow suppliers to update the status of their own orders
DROP POLICY IF EXISTS "Suppliers can update own orders" ON store_orders;
CREATE POLICY "Suppliers can update own orders"
ON store_orders FOR UPDATE
TO authenticated
USING (supplier_id = auth.uid())
WITH CHECK (supplier_id = auth.uid());
