-- Ensure store_order_items has item_status
ALTER TABLE public.store_order_items 
ADD COLUMN IF NOT EXISTS item_status text DEFAULT 'pending';

-- Add check constraint for valid status values if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_item_status') THEN
        ALTER TABLE public.store_order_items 
        ADD CONSTRAINT check_item_status 
        CHECK (item_status IN ('pending', 'accepted', 'unavailable'));
    END IF;
END $$;

-- Create/Replace function to recalculate order total
CREATE OR REPLACE FUNCTION recalculate_order_total(order_id_param uuid)
RETURNS void AS $$
DECLARE
    new_total numeric;
BEGIN
    -- Calculate sum of (price * quantity) for all items that are NOT 'unavailable'
    SELECT COALESCE(SUM(price_at_purchase * quantity), 0)
    INTO new_total
    FROM public.store_order_items
    WHERE order_id = order_id_param
    AND item_status != 'unavailable';

    -- Update the store_orders table
    UPDATE public.store_orders
    SET total_amount = new_total
    WHERE id = order_id_param;
END;
$$ LANGUAGE plpgsql;

-- Ensure RLS allows suppliers to update order items status
-- (We already have some policies, but let's make sure update is allowed on store_order_items for the item_status column effectively)
-- Actually, RLS on store_orders is what we fixed. store_order_items might need UPDATE policy for suppliers.

DROP POLICY IF EXISTS "Suppliers can update items of their orders" ON store_order_items;
CREATE POLICY "Suppliers can update items of their orders" ON store_order_items FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM store_orders JOIN suppliers ON store_orders.supplier_id = suppliers.id WHERE store_orders.id = store_order_items.order_id AND (suppliers.user_id = auth.uid() OR suppliers.profile_id = auth.uid()))
) WITH CHECK (
    EXISTS (SELECT 1 FROM store_orders JOIN suppliers ON store_orders.supplier_id = suppliers.id WHERE store_orders.id = store_order_items.order_id AND (suppliers.user_id = auth.uid() OR suppliers.profile_id = auth.uid()))
);

-- Also allow suppliers to update order status in store_orders
DROP POLICY IF EXISTS "Suppliers can update their assigned orders" ON store_orders;
CREATE POLICY "Suppliers can update their assigned orders" ON store_orders FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM suppliers WHERE id = store_orders.supplier_id AND (user_id = auth.uid() OR profile_id = auth.uid()))
) WITH CHECK (
    EXISTS (SELECT 1 FROM suppliers WHERE id = store_orders.supplier_id AND (user_id = auth.uid() OR profile_id = auth.uid()))
);
