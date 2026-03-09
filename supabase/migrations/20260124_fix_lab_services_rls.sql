-- =============================================
-- FIX LAB_SERVICES TABLE AND RLS (SIMPLIFIED)
-- =============================================

-- 1. Enable RLS
ALTER TABLE lab_services ENABLE ROW LEVEL SECURITY;

-- 2. Drop old policies
DROP POLICY IF EXISTS "Labs can view their services" ON lab_services;
DROP POLICY IF EXISTS "Labs can insert their services" ON lab_services;
DROP POLICY IF EXISTS "Labs can update their services" ON lab_services;
DROP POLICY IF EXISTS "Labs can delete their services" ON lab_services;
DROP POLICY IF EXISTS "Anyone can view active services" ON lab_services;

-- 3. Simple RLS - match lab_id (stored as text) OR allow public read
CREATE POLICY "Labs can manage their services"
    ON lab_services FOR ALL
    USING (lab_id = auth.uid()::text OR TRUE)
    WITH CHECK (lab_id = auth.uid()::text);

-- 4. Public read for clinics to view lab services
CREATE POLICY "Anyone can view services"
    ON lab_services FOR SELECT
    USING (TRUE);

-- 5. Update status constraint
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
