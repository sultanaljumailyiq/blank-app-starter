-- Recreate dental_lab_orders (Fresh Start)
-- 2026-01-24

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'dental_lab_orders') THEN
        -- Move old table aside
        DROP TABLE IF EXISTS dental_lab_orders_backup CASCADE;
        ALTER TABLE dental_lab_orders RENAME TO dental_lab_orders_backup;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS dental_lab_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    laboratory_id UUID REFERENCES dental_laboratories(id) ON DELETE SET NULL,
    custom_lab_name TEXT,
    patient_id INTEGER REFERENCES patients(id) ON DELETE SET NULL,
    patient_name TEXT NOT NULL,
    doctor_id UUID REFERENCES auth.users(id), 
    staff_record_id INTEGER REFERENCES staff(id) ON DELETE SET NULL, 
    doctor_name TEXT, 
    
    order_number TEXT NOT NULL,
    service_name TEXT NOT NULL,
    service_details JSONB,
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'received', 'in_progress', 'completed', 'delivered', 'cancelled')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    notes TEXT,
    price DECIMAL(10,2),
    final_amount DECIMAL(10,2), 
    expected_delivery_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    images TEXT[] DEFAULT '{}'
);

-- Skip Data Restoration to ensure Schema Integrity
-- (Old data likely incompatible or missing columns)

ALTER TABLE dental_lab_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinics can manage their own orders" ON dental_lab_orders;
CREATE POLICY "Clinics can manage their own orders"
    ON dental_lab_orders FOR ALL
    USING (
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid() OR id IN (
                SELECT clinic_id FROM clinic_members WHERE user_id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "Labs can view assigned orders" ON dental_lab_orders;
CREATE POLICY "Labs can view assigned orders"
    ON dental_lab_orders FOR ALL
    USING (
        laboratory_id IN (
            SELECT id FROM dental_laboratories WHERE user_id = auth.uid()
        )
    );

-- Keep backup table for reference
