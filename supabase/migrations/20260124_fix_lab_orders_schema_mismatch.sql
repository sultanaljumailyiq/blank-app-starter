-- Fix dental_lab_orders type mismatch (Robust)
-- 2026-01-24

-- 1. Drop Dependencies (Policies)
DROP POLICY IF EXISTS "Clinics can manage their own orders" ON dental_lab_orders;
DROP POLICY IF EXISTS "Labs can view assigned orders" ON dental_lab_orders;

-- 2. Modify Columns (UUID -> INTEGER)
-- Clinic ID
ALTER TABLE dental_lab_orders 
DROP CONSTRAINT IF EXISTS dental_lab_orders_clinic_id_fkey;

ALTER TABLE dental_lab_orders 
ALTER COLUMN clinic_id TYPE INTEGER USING (NULL); 

ALTER TABLE dental_lab_orders
ADD CONSTRAINT dental_lab_orders_clinic_id_fkey 
FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;

-- Patient ID
ALTER TABLE dental_lab_orders
DROP CONSTRAINT IF EXISTS dental_lab_orders_patient_id_fkey;

ALTER TABLE dental_lab_orders
ALTER COLUMN patient_id TYPE INTEGER USING (NULL);

ALTER TABLE dental_lab_orders
ADD CONSTRAINT dental_lab_orders_patient_id_fkey
FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL;

-- 3. Ensure Doctor ID is Nullable (using staff_record_id instead)
ALTER TABLE dental_lab_orders
ALTER COLUMN doctor_id DROP NOT NULL;

-- 4. Re-create Policies
CREATE POLICY "Clinics can manage their own orders"
    ON dental_lab_orders FOR ALL
    USING (
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid() OR id IN (
                SELECT clinic_id FROM clinic_members WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Labs can view assigned orders"
    ON dental_lab_orders FOR ALL
    USING (
        laboratory_id IN (
            SELECT id FROM dental_laboratories WHERE user_id = auth.uid()
        )
    );
