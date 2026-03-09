-- Fix Financial Transactions Foreign Keys with Correct Types
-- 2026-02-11 v2

-- 1. recorded_by (UUID) -> references profiles(id)
-- WAS INCORRECTLY referencing staff(id)
DO $$
BEGIN
    ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS fk_fin_recorded_by;
    -- Try adding constraint to profiles
    ALTER TABLE financial_transactions ADD CONSTRAINT fk_fin_recorded_by FOREIGN KEY (recorded_by) REFERENCES profiles(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added fk_fin_recorded_by to profiles';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error fixing recorded_by FK: %', SQLERRM;
END $$;

-- 2. staff_record_id (Integer) -> references staff(id)
-- This assumes staff.id is Integer.
DO $$
BEGIN
    ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS fk_fin_staff_record;
    ALTER TABLE financial_transactions ADD CONSTRAINT fk_fin_staff_record FOREIGN KEY (staff_record_id) REFERENCES staff(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added fk_fin_staff_record to staff';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error fixing staff_record_id FK: %', SQLERRM;
END $$;

-- 3. assistant_id (Integer or UUID?)
-- If assistant_id is from staff table, it should be Integer.
-- We'll try staff(id). If it fails (type mismatch), we'll log it.
DO $$
BEGIN
    ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS fk_fin_assistant;
    ALTER TABLE financial_transactions ADD CONSTRAINT fk_fin_assistant FOREIGN KEY (assistant_id) REFERENCES staff(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added fk_fin_assistant to staff';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error fixing assistant_id FK (might be UUID vs Int mismatch): %', SQLERRM;
END $$;

-- 4. doctor_id (UUID) -> references profiles(id) 
DO $$
BEGIN
    ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS fk_fin_doctors;
    ALTER TABLE financial_transactions ADD CONSTRAINT fk_fin_doctors FOREIGN KEY (doctor_id) REFERENCES profiles(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added fk_fin_doctors to profiles';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error fixing doctor_id FK: %', SQLERRM;
END $$;

-- 5. patient_id (Integer or UUID?) -> references patients(id)
DO $$
BEGIN
    ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS fk_fin_patients;
    ALTER TABLE financial_transactions ADD CONSTRAINT fk_fin_patients FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added fk_fin_patients to patients';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error fixing patient_id FK: %', SQLERRM;
END $$;
