-- Fix Supplier Order Visibility RLS
-- Problem: 'supplier_id' in store_orders might be the 'suppliers.id' (UUID) or 'auth.uid()' (UUID).
-- The current policy only checks 'supplier_id = auth.uid()'.
-- We need to check if 'supplier_id' matches auth.uid() OR if 'supplier_id' matches a supplier profile owned by auth.uid().

DROP POLICY IF EXISTS "Suppliers view their own orders" ON store_orders;
CREATE POLICY "Suppliers view their own orders"
ON store_orders FOR SELECT
TO authenticated
USING (
  (supplier_id = auth.uid()) -- Case 1: stored as User ID
  OR 
  (supplier_id IN ( -- Case 2: stored as Supplier Profile ID
    SELECT id FROM suppliers WHERE user_id = auth.uid() OR profile_id = auth.uid()
  ))
)
-- Also ensure deleted_by_supplier is false (Soft Delete)
AND (COALESCE(deleted_by_supplier, false) = false); 
-- Note regarding syntax: The AND clause applies to the whole result of the OR group if parenthesized correctly.
-- Let's make it unambiguous:

DROP POLICY IF EXISTS "Suppliers view their own orders_v2" ON store_orders;
CREATE POLICY "Suppliers view their own orders_v2"
ON store_orders FOR SELECT
TO authenticated
USING (
  (
    (supplier_id = auth.uid()) 
    OR 
    (supplier_id IN (SELECT id FROM suppliers WHERE user_id = auth.uid() OR profile_id = auth.uid()))
  )
  AND 
  (COALESCE(deleted_by_supplier, false) = false)
);
