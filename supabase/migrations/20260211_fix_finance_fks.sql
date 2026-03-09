-- Fix Financial Transactions Foreign Keys with Explicit Names
-- 2026-02-11

-- 1. recorded_by (references staff.id)
DO $$
BEGIN
    -- Try to drop existing constraint if it exists (generic name unknown, so we try to drop by column if possible or just add new one)
    -- Postgres doesn't allow "DROP CONSTRAINT IF EXISTS ON COLUMN", we have to know the name.
    -- Instead, we will try to ADD the constraint with a specific name. If it fails, we assume it might already exist or conflicting.
    -- Best approach: Drop the specific named constraint if it exists, then add it.
    
    ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS fk_fin_recorded_by;
    ALTER TABLE financial_transactions ADD CONSTRAINT fk_fin_recorded_by FOREIGN KEY (recorded_by) REFERENCES staff(id) ON DELETE SET NULL;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error fixing recorded_by FK: %', SQLERRM;
END $$;

-- 2. staff_record_id (references staff.id)
DO $$
BEGIN
    ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS fk_fin_staff_record;
    ALTER TABLE financial_transactions ADD CONSTRAINT fk_fin_staff_record FOREIGN KEY (staff_record_id) REFERENCES staff(id) ON DELETE SET NULL;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error fixing staff_record_id FK: %', SQLERRM;
END $$;

-- 3. assistant_id (references staff.id)
DO $$
BEGIN
    ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS fk_fin_assistant;
    ALTER TABLE financial_transactions ADD CONSTRAINT fk_fin_assistant FOREIGN KEY (assistant_id) REFERENCES staff(id) ON DELETE SET NULL;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error fixing assistant_id FK: %', SQLERRM;
END $$;

-- 4. doctor_id (references profiles.id OR staff.id?) 
-- Based on previous analysis, doctor_id is a UUID referencing auth.users/profiles.
-- Ensure fk_fin_doctors references profiles(id).
DO $$
BEGIN
    ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS fk_fin_doctors;
    ALTER TABLE financial_transactions ADD CONSTRAINT fk_fin_doctors FOREIGN KEY (doctor_id) REFERENCES profiles(id) ON DELETE SET NULL;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error fixing doctor_id FK: %', SQLERRM;
END $$;

-- 5. patient_id (references patients.id)
-- Ensure fk_fin_patients exists
DO $$
BEGIN
    ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS fk_fin_patients;
    ALTER TABLE financial_transactions ADD CONSTRAINT fk_fin_patients FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL;

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error fixing patient_id FK: %', SQLERRM;
END $$;
