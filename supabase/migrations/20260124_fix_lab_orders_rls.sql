-- Fix RLS for Dental Lab Orders
-- 2026-01-24

ALTER TABLE dental_lab_orders ENABLE ROW LEVEL SECURITY;

-- Drop existin policies to start fresh (safer)
DROP POLICY IF EXISTS "Clinics can manage their orders" ON dental_lab_orders;
DROP POLICY IF EXISTS "Labs can manage their orders" ON dental_lab_orders;

-- Policy for Clinics
CREATE POLICY "Clinics can manage their orders"
ON dental_lab_orders
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM clinics c
        WHERE c.id = dental_lab_orders.clinic_id
        AND (c.owner_id = auth.uid() OR 
             EXISTS (SELECT 1 FROM clinic_members cm WHERE cm.clinic_id = c.id AND cm.user_id = auth.uid())
        )
    )
);

-- Policy for Labs
CREATE POLICY "Labs can manage their orders"
ON dental_lab_orders
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM dental_laboratories l
        WHERE l.id = dental_lab_orders.laboratory_id
        AND l.user_id = auth.uid()
    )
);

-- Allow reading custom orders for clinics (already covered by first policy, but just in case)
-- Note: Labs don't need to see custom orders where laboratory_id is null.
