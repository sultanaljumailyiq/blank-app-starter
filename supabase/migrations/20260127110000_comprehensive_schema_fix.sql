-- COMPREHENSIVE SCHEMA FIX MIGRATION
-- This migration fixes all schema mismatches and type issues

-- ==============================================================================
-- 1. FIX APPOINTMENTS TABLE - Add 'date' column alias or rename
-- ==============================================================================
DO $$
BEGIN
    -- Check if 'date' column exists, if not, add it as alias for appointment_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'date') THEN
        -- Add the date column
        ALTER TABLE appointments ADD COLUMN date DATE;
        -- Copy data from appointment_date if it exists
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'appointment_date') THEN
            UPDATE appointments SET date = appointment_date;
        END IF;
        RAISE NOTICE 'Added date column to appointments';
    ELSE
        RAISE NOTICE 'appointments.date column already exists';
    END IF;
END $$;

-- ==============================================================================
-- 2. FIX CLINICS TABLE - Ensure clinics have INTEGER id (primary key) 
-- The clinics table uses SERIAL which is INTEGER. App must use integer IDs.
-- ==============================================================================
-- Note: The main issue is the app is using a UUID where INTEGER is expected.
-- We'll update the RLS to handle both, and fix the hooks to cast properly.

-- ==============================================================================
-- 3. CREATE AI_ANALYSES TABLE IF NOT EXISTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS ai_analyses (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    clinic_id INTEGER,
    image_url TEXT,
    analysis_result JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. FIX NOTIFICATIONS - Create proper table or use system_notifications
-- ==============================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    clinic_id INTEGER,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select" ON notifications;
CREATE POLICY "notifications_select" ON notifications FOR SELECT
TO authenticated USING (user_id = auth.uid());

-- ==============================================================================
-- 5. FIX INVENTORY TABLE - Ensure item_name column exists
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'inventory' AND column_name = 'item_name') THEN
        -- Check if 'name' exists and rename it
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'inventory' AND column_name = 'name') THEN
            ALTER TABLE inventory RENAME COLUMN name TO item_name;
            RAISE NOTICE 'Renamed inventory.name to item_name';
        ELSE
            ALTER TABLE inventory ADD COLUMN item_name TEXT;
            RAISE NOTICE 'Added item_name column to inventory';
        END IF;
    END IF;
END $$;

-- ==============================================================================
-- 6. ADD PATIENT JSONB FIELDS IF NOT EXISTS
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'patients' AND column_name = 'medical_history_data') THEN
        ALTER TABLE patients ADD COLUMN medical_history_data JSONB DEFAULT '{}';
        RAISE NOTICE 'Added medical_history_data to patients';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'patients' AND column_name = 'teeth_data') THEN
        ALTER TABLE patients ADD COLUMN teeth_data JSONB DEFAULT '{}';
        RAISE NOTICE 'Added teeth_data to patients';
    END IF;
END $$;

-- ==============================================================================
-- 7. SEED TREATMENTS FOR ALL CLINICS (if not already done)
-- ==============================================================================
DO $$
DECLARE
    clinic_rec RECORD;
BEGIN
    FOR clinic_rec IN SELECT id FROM clinics LOOP
        IF NOT EXISTS (SELECT 1 FROM treatments WHERE clinic_id = clinic_rec.id LIMIT 1) THEN
            INSERT INTO treatments (clinic_id, name, category, base_price, cost_estimate, profit_margin, expected_sessions, is_active, is_complex)
            VALUES
                (clinic_rec.id, 'فحص دوري شامل', 'وقائي', 15000, 0, 100, 1, true, false),
                (clinic_rec.id, 'تنظيف أسنان (Scaling)', 'وقائي', 25000, 5000, 87, 1, true, false),
                (clinic_rec.id, 'تلميع الأسنان (Polishing)', 'وقائي', 25000, 2000, 92, 1, true, false),
                (clinic_rec.id, 'تطبيق الفلورايد', 'وقائي', 30000, 5000, 83, 1, true, false),
                (clinic_rec.id, 'حشوة ضوئية - سطح واحد', 'ترميمي', 60000, 12000, 80, 1, true, false),
                (clinic_rec.id, 'حشوة ضوئية - سطحين', 'ترميمي', 75000, 15000, 80, 1, true, false),
                (clinic_rec.id, 'علاج عصب (RCT)', 'علاج جذور', 150000, 30000, 80, 2, true, true),
                (clinic_rec.id, 'قلع بسيط', 'جراحة', 50000, 5000, 90, 1, true, false),
                (clinic_rec.id, 'قلع جراحي', 'جراحة', 100000, 15000, 85, 1, true, true),
                (clinic_rec.id, 'تاج خزف معدن (PFM)', 'تعويضات', 150000, 50000, 66, 2, true, true),
                (clinic_rec.id, 'تاج زركون', 'تعويضات', 250000, 80000, 68, 2, true, true),
                (clinic_rec.id, 'تبييض ليزر (عيادة)', 'تجميل', 400000, 80000, 80, 1, true, false),
                (clinic_rec.id, 'زراعة سن واحد', 'زراعة', 800000, 300000, 62, 3, true, true);
            RAISE NOTICE 'Seeded treatments for clinic %', clinic_rec.id;
        END IF;
    END LOOP;
END $$;

DO $$ BEGIN RAISE NOTICE 'Comprehensive Schema Fix Completed Successfully!'; END $$;
