-- Add item_status column to store_order_items table
ALTER TABLE public.store_order_items 
ADD COLUMN IF NOT EXISTS item_status text DEFAULT 'pending';

-- Add check constraint for valid status values
ALTER TABLE public.store_order_items 
ADD CONSTRAINT check_item_status 
CHECK (item_status IN ('pending', 'accepted', 'unavailable'));

-- Create a function to recalculate order total
CREATE OR REPLACE FUNCTION recalculate_order_total(order_id_param uuid)
RETURNS void AS $$
DECLARE
    new_total numeric;
BEGIN
    -- Calculate sum of (price * quantity) for all items that are NOT 'unavailable'
    SELECT COALESCE(SUM(price * quantity), 0)
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
