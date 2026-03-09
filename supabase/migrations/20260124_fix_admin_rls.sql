
-- Enable read access for all authenticated users on store_orders
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."store_orders";
CREATE POLICY "Enable read access for all users" ON "public"."store_orders" FOR SELECT USING (true);

-- Enable read access for all authenticated users on store_order_items
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."store_order_items";
CREATE POLICY "Enable read access for all users" ON "public"."store_order_items" FOR SELECT USING (true);
