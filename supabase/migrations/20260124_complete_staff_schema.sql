-- Complete Staff and Clinic Schema Migration (Fixed Types)
-- 2026-01-24

-- 0. Ensure Dependency Tables Exist (Safeguard)
CREATE TABLE IF NOT EXISTS clinic_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'staff',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(clinic_id, user_id)
);

CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id),
    patient_id INTEGER REFERENCES patients(id), -- FIXED: INTEGER
    doctor_id UUID REFERENCES auth.users(id),
    date DATE,
    time TIME,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS treatments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id),
    patient_id INTEGER REFERENCES patients(id), -- FIXED: INTEGER
    doctor_id UUID,
    description TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id),
    amount DECIMAL(10, 2),
    type TEXT, 
    category TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 1. Enhance Clinics Table (Settings)
ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS is_digital_booking_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- 2. Create Clinic Branches Table
CREATE TABLE IF NOT EXISTS clinic_branches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    is_main BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for branches
ALTER TABLE clinic_branches ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clinic_branches') THEN
        CREATE POLICY "Clinics manage branches" ON clinic_branches FOR ALL USING (
            EXISTS (SELECT 1 FROM clinics c WHERE c.id = clinic_branches.clinic_id AND c.owner_id = auth.uid()) OR
            EXISTS (SELECT 1 FROM clinic_members cm WHERE cm.clinic_id = clinic_branches.clinic_id AND cm.user_id = auth.uid())
        );
    END IF;
END $$;

-- 3. Enhance Staff Table (Full Profile)
-- Ensure staff table exists
CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER REFERENCES clinics(id),
    full_name TEXT,
    role_title TEXT,
    department TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE staff
ADD COLUMN IF NOT EXISTS work_schedule JSONB DEFAULT '{"days":[], "startTime":"09:00", "endTime":"17:00"}'::jsonb,
ADD COLUMN IF NOT EXISTS attendance_stats JSONB DEFAULT '{"present":0, "absent":0, "late":0}'::jsonb,
ADD COLUMN IF NOT EXISTS performance_stats JSONB DEFAULT '{"rating":5}'::jsonb,
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS qualifications TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS username TEXT; 

-- 4. Link Operations to Staff Record (Integer ID)
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS staff_record_id INTEGER REFERENCES staff(id) ON DELETE SET NULL;

ALTER TABLE financial_transactions
ADD COLUMN IF NOT EXISTS staff_record_id INTEGER REFERENCES staff(id) ON DELETE SET NULL;

ALTER TABLE treatments
ADD COLUMN IF NOT EXISTS staff_record_id INTEGER REFERENCES staff(id) ON DELETE SET NULL;

-- 5. Additional Indexing
CREATE INDEX IF NOT EXISTS idx_appointments_staff_record ON appointments(staff_record_id);
CREATE INDEX IF NOT EXISTS idx_finance_staff_record ON financial_transactions(staff_record_id);
