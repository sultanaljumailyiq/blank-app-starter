-- =============================================
-- CREATE UPDATE_ORDER_STATUS RPC
-- =============================================

-- Drop existing function first
DROP FUNCTION IF EXISTS update_order_status(UUID, UUID, TEXT, TEXT, TEXT);

-- Create or Replace the RPC function for updating order status
CREATE OR REPLACE FUNCTION update_order_status(
    p_order_id UUID,
    p_status_changed_by UUID,
    p_new_status TEXT,
    p_status_description TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- Update the order status
    UPDATE dental_lab_orders
    SET 
        status = p_new_status,
        updated_at = NOW()
    WHERE id = p_order_id;

    -- Insert status history record if table exists
    BEGIN
        INSERT INTO order_status_history (
            order_id,
            status,
            changed_by,
            description,
            notes,
            created_at
        ) VALUES (
            p_order_id,
            p_new_status,
            p_status_changed_by,
            p_status_description,
            p_notes,
            NOW()
        );
    EXCEPTION WHEN undefined_table THEN
        -- Table doesn't exist, skip history insert
        NULL;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION update_order_status TO authenticated;

-- Create order status history table if not exists
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES dental_lab_orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    description TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on history table
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- RLS policy for history
DROP POLICY IF EXISTS "Users can view status history" ON order_status_history;
CREATE POLICY "Users can view status history"
    ON order_status_history FOR SELECT
    USING (TRUE);

DROP POLICY IF EXISTS "Users can insert status history" ON order_status_history;
CREATE POLICY "Users can insert status history"
    ON order_status_history FOR INSERT
    WITH CHECK (TRUE);

-- Update status check constraint to include all status values
ALTER TABLE dental_lab_orders DROP CONSTRAINT IF EXISTS dental_lab_orders_status_check;
ALTER TABLE dental_lab_orders ADD CONSTRAINT dental_lab_orders_status_check 
CHECK (status IN (
    'pending', 
    'waiting_for_representative', 
    'representative_dispatched', 
    'in_progress',
    'in-progress',
    'completed',
    'out_for_delivery', 
    'delivered', 
    'returned', 
    'cancelled', 
    'rejected', 
    'modification_requested',
    'confirmed',
    'processing',
    'ready_for_pickup',
    'ready_for_delivery',
    'ready'
));

-- Add rating and total_ratings columns to dental_laboratories if not exist
ALTER TABLE dental_laboratories 
ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;

-- Add rating column to dental_lab_orders if not exist
ALTER TABLE dental_lab_orders 
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

ALTER TABLE dental_lab_orders 
ADD COLUMN IF NOT EXISTS review_note TEXT;

ALTER TABLE dental_lab_orders 
ADD COLUMN IF NOT EXISTS modification_note TEXT;

ALTER TABLE dental_lab_orders 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
