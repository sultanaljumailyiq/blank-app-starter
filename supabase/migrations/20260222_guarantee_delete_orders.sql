-- Create a new script to guarantee the DELETE policy works for clinics.
DROP POLICY IF EXISTS "Clinics can delete their own orders" ON dental_lab_orders;
DROP POLICY IF EXISTS "Enable delete for users based on clinic_id" ON dental_lab_orders;
DROP POLICY IF EXISTS "Users can delete own clinic orders" ON dental_lab_orders;
DROP POLICY IF EXISTS "Doctors can delete orders" ON dental_lab_orders;
DROP POLICY IF EXISTS "Staff can delete orders" ON dental_lab_orders;

CREATE POLICY "Clinics can delete their own orders"
ON dental_lab_orders FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM clinics WHERE clinics.id = dental_lab_orders.clinic_id AND clinics.owner_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM clinic_members WHERE clinic_members.clinic_id = dental_lab_orders.clinic_id AND clinic_members.user_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'doctor'
    )
);
