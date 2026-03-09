-- Add dispute tracking to dental_lab_orders
ALTER TABLE dental_lab_orders 
ADD COLUMN IF NOT EXISTS is_disputed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS dispute_reason TEXT,
ADD COLUMN IF NOT EXISTS dispute_created_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS dispute_resolved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS dispute_resolution_notes TEXT,
ADD COLUMN IF NOT EXISTS dispute_status TEXT CHECK (dispute_status IN ('open', 'resolved', 'dismissed'));

-- Index for disputes
CREATE INDEX IF NOT EXISTS idx_dental_lab_orders_disputed ON dental_lab_orders(is_disputed);
