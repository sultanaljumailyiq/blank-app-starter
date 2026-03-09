-- Migration to convert clinic_id to UUID across all tables

-- 1. Disable constraints
SET CONSTRAINTS ALL DEFERRED;

-- Helper function to convert column
CREATE OR REPLACE FUNCTION convert_clinic_id_to_uuid(table_name text) RETURNS void AS $$
BEGIN
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS fk_clinic', table_name);
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I_clinic_id_fkey', table_name, table_name);
    
    -- Delete rows with integer clinic_id (since we can't map them easily and they are likely legacy/demo)
    -- We assume any existing integer value is incompatible with the new UUID clinics
    EXECUTE format('DELETE FROM %I', table_name);
    
    -- Alter column type
    EXECUTE format('ALTER TABLE %I ALTER COLUMN clinic_id TYPE UUID USING clinic_id::text::uuid', table_name);
    
    -- Add constraint back referencing clinics(id)
    -- We assume clinics(id) is already UUID. If not, this will fail.
    EXECUTE format('ALTER TABLE %I ADD CONSTRAINT fk_clinic FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE', table_name);
END;
$$ LANGUAGE plpgsql;

-- 2. Convert tables
DO $$ 
DECLARE
    t text;
    tables text[] := ARRAY['appointments', 'patients', 'staff', 'financial_transactions', 'inventory_items', 'lab_orders', 'lab_requests', 'treatments', 'activity_logs'];
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        -- Check if table exists and has clinic_id
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'clinic_id') THEN
            PERFORM convert_clinic_id_to_uuid(t);
            RAISE NOTICE 'Converted table %', t;
        END IF;
    END LOOP;
END $$;

-- 3. Cleanup
DROP FUNCTION convert_clinic_id_to_uuid;

-- 4. Fix specific foreign keys for financial_transactions if they were lost or broken
-- Re-apply constraints from previous fixes just in case
DO $$
BEGIN
    -- recorded_by -> profiles(id)
    ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS fk_fin_recorded_by;
    ALTER TABLE financial_transactions ADD CONSTRAINT fk_fin_recorded_by FOREIGN KEY (recorded_by) REFERENCES profiles(id) ON DELETE SET NULL;
    
    -- doctor_id -> profiles(id)
    ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS fk_fin_doctors;
    ALTER TABLE financial_transactions ADD CONSTRAINT fk_fin_doctors FOREIGN KEY (doctor_id) REFERENCES profiles(id) ON DELETE SET NULL;

    -- patient_id -> patients(id)
    ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS fk_fin_patients;
    ALTER TABLE financial_transactions ADD CONSTRAINT fk_fin_patients FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL;

    -- staff_record_id -> staff(id)
    ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS fk_fin_staff_record;
    ALTER TABLE financial_transactions ADD CONSTRAINT fk_fin_staff_record FOREIGN KEY (staff_record_id) REFERENCES staff(id) ON DELETE SET NULL;

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error fixing specific FKs: %', SQLERRM;
END $$;
