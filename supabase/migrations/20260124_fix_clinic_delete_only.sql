-- Fix: Only clinics should delete their own orders, not labs

-- Remove the lab delete policy we added by mistake
DROP POLICY IF EXISTS "Labs can delete their orders" ON dental_lab_orders;

-- Ensure clinic delete policy exists
DROP POLICY IF EXISTS "Clinics can delete their own orders" ON dental_lab_orders;
CREATE POLICY "Clinics can delete their own orders"
    ON dental_lab_orders FOR DELETE
    USING (
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid() OR id IN (
                SELECT clinic_id FROM clinic_members WHERE user_id = auth.uid()
            )
        )
    );
