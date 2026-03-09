-- Fix Schema Mismatches and Missing Columns

-- 1. CLINICS Table Updates
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS working_hours TEXT;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS location JSONB;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS services TEXT[];
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS specialties TEXT[];

-- 2. APPOINTMENTS Table Updates
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS time TIME;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS cost DECIMAL;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_name TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_name TEXT;

-- 3. INVENTORY & SUPPLIERS
-- Ensure suppliers table exists or inventory has supplier info
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS supplier_name TEXT;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS min_stock INTEGER DEFAULT 10;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS clinic_id BIGINT; -- Ensure link exists

-- 4. STAFF
-- Ensure auth columns (previous step might have covered this, but being safe)
ALTER TABLE staff ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 5. NOTIFICATIONS
-- Ensure notifications table has clinic_id
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS clinic_id BIGINT REFERENCES clinics(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS laboratory_id UUID; 
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';

-- 6. SYSTEM NOTIFICATIONS (New Table)
CREATE TABLE IF NOT EXISTS system_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id BIGINT REFERENCES clinics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- info, warning, success, error
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policy for notifications
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notifications for their clinics" ON system_notifications
    FOR SELECT
    USING (
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid()
            UNION
            SELECT clinic_id FROM staff WHERE phone = (SELECT phone FROM auth.users WHERE id = auth.uid() LIMIT 1) -- Rough approximation for demo
        )
    );
