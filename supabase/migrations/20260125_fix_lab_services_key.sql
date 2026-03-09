-- Fix lab_services schema to reference dental_laboratories instead of profiles
-- This aligns it with the rest of the Lab Dashboard architecture

-- 1. Migrate existing data (User ID -> Lab ID)
-- Assuming existing lab_id contains user_id. We map it to dental_laboratories.id
DO $$
BEGIN
    UPDATE lab_services ls
    SET lab_id = dl.id
    FROM dental_laboratories dl
    WHERE ls.lab_id = dl.user_id;
END $$;

-- 2. Drop old FK constraint
ALTER TABLE lab_services DROP CONSTRAINT IF EXISTS lab_services_lab_id_fkey;
ALTER TABLE lab_services DROP CONSTRAINT IF EXISTS lab_services_lab_id_fkey1; -- Just in case

-- 3. Add new FK constraint to dental_laboratories
ALTER TABLE lab_services
ADD CONSTRAINT lab_services_lab_id_fkey
FOREIGN KEY (lab_id)
REFERENCES dental_laboratories(id)
ON DELETE CASCADE;

-- 4. Enable RLS and verify policies (already done in previous script but good to ensure)
ALTER TABLE lab_services ENABLE ROW LEVEL SECURITY;

-- 5. Create index if missing
CREATE INDEX IF NOT EXISTS idx_lab_services_lab_real ON lab_services(lab_id);
