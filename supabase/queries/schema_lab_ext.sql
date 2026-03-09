-- ==============================================================================
-- LAB EXTENSION SCHEMA (Fixed)
-- ==============================================================================

-- Ensure dental_laboratories has all fields
ALTER TABLE dental_laboratories ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE dental_laboratories ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE dental_laboratories ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE dental_laboratories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE dental_laboratories ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE dental_laboratories ADD COLUMN IF NOT EXISTS services_list TEXT[];
ALTER TABLE dental_laboratories ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1);

-- Lab Services (Catalog)
CREATE TABLE IF NOT EXISTS lab_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    laboratory_id UUID REFERENCES dental_laboratories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT true
);
ALTER TABLE lab_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read lab services" ON lab_services;
CREATE POLICY "Public read lab services" ON lab_services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Labs manage services" ON lab_services;
CREATE POLICY "Labs manage services" ON lab_services FOR ALL USING (laboratory_id IN (SELECT id FROM dental_laboratories WHERE user_id = auth.uid()));

-- Lab Delegates (Representatives)
CREATE TABLE IF NOT EXISTS lab_delegates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    laboratory_id UUID REFERENCES dental_laboratories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    area TEXT,
    is_active BOOLEAN DEFAULT true
);
ALTER TABLE lab_delegates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Labs manage delegates" ON lab_delegates;
CREATE POLICY "Labs manage delegates" ON lab_delegates FOR ALL USING (laboratory_id IN (SELECT id FROM dental_laboratories WHERE user_id = auth.uid()));
