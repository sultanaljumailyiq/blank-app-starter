-- Migration: Unify Staff Identity (Remove doctor_id, Use staff_id ONLY)
-- Covers: Appointments, Financial Transactions, Lab Orders, Lab Requests

-- 1. Disable constraints temporarily
SET CONSTRAINTS ALL DEFERRED;

-- Step 1: Create Shadow Staff Records for Owners
DO $$
DECLARE
    clinic_record RECORD;
    owner_user_id UUID;
    new_staff_id INT;
BEGIN
    FOR clinic_record IN SELECT * FROM clinics LOOP
        owner_user_id := clinic_record.owner_id;
        
        -- Check if this owner has a staff record in this clinic linked via user_id
        IF NOT EXISTS (SELECT 1 FROM staff WHERE clinic_id = clinic_record.id AND user_id = owner_user_id) THEN
            
            INSERT INTO staff (clinic_id, full_name, role_title, email, phone, status, user_id, salary, join_date)
            SELECT 
                clinic_record.id,
                'د. ' || COALESCE((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = owner_user_id), 'المالك'),
                'طبيب / مالك',
                (SELECT email FROM auth.users WHERE id = owner_user_id),
                COALESCE((SELECT phone FROM auth.users WHERE id = owner_user_id), '0000000000'),
                'active',
                owner_user_id,
                0,
                CURRENT_DATE
            RETURNING id INTO new_staff_id;
            
            RAISE NOTICE 'Created shadow staff record (ID: %) for Owner of Clinic %', new_staff_id, clinic_record.id;
        END IF;
    END LOOP;
END $$;

-- Step 2: Customer Migration - Appointments
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'staff_id') THEN
        ALTER TABLE appointments ADD COLUMN staff_id INT REFERENCES staff(id);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'doctor_id') THEN
        UPDATE appointments a
        SET staff_id = s.id
        FROM staff s
        WHERE a.doctor_id = s.user_id AND a.clinic_id = s.clinic_id
        AND a.staff_id IS NULL;
    END IF;
END $$;

-- Step 3: Customer Migration - Financial Transactions
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'recorded_by_staff_id') THEN
        ALTER TABLE financial_transactions ADD COLUMN recorded_by_staff_id INT REFERENCES staff(id);
    END IF;
    
    -- Fix recorded_by
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'recorded_by') THEN
        UPDATE financial_transactions f
        SET recorded_by_staff_id = s.id
        FROM staff s
        WHERE f.recorded_by = s.user_id AND f.clinic_id = s.clinic_id
        AND f.recorded_by_staff_id IS NULL;
    END IF;

    -- Fix doctor_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'doctor_id') THEN
        UPDATE financial_transactions f
        SET staff_record_id = s.id
        FROM staff s
        WHERE f.doctor_id = s.user_id AND f.clinic_id = s.clinic_id
        AND f.staff_record_id IS NULL;
    END IF;
END $$;

-- Step 4: Customer Migration - Lab Orders / Lab Requests
-- We need to check if columns exist and migrate them
DO $$ BEGIN
    -- Lab Orders (dentist_id often used)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_orders' AND column_name = 'dentist_id') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_orders' AND column_name = 'staff_id') THEN
            ALTER TABLE lab_orders ADD COLUMN staff_id INT REFERENCES staff(id);
        END IF;
        
        -- Migrate dentist_id (UUID) -> staff_id (INT)
        UPDATE lab_orders l
        SET staff_id = s.id
        FROM staff s
        WHERE l.dentist_id = s.user_id AND l.clinic_id = s.clinic_id
        AND l.staff_id IS NULL;
    END IF;

    -- Lab Requests (doctor_id often used)
     IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_requests' AND column_name = 'doctor_id') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_requests' AND column_name = 'staff_id') THEN
            ALTER TABLE lab_requests ADD COLUMN staff_id INT REFERENCES staff(id);
        END IF;
        
        -- Migrate doctor_id (UUID) -> staff_id (INT)
        UPDATE lab_requests l
        SET staff_id = s.id
        FROM staff s
        WHERE l.doctor_id = s.user_id AND l.clinic_id = s.clinic_id
        AND l.staff_id IS NULL;
    END IF;
END $$;


-- Step 5: Cleanup - Drop old columns safely
DO $$ BEGIN
    -- Appointments
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'doctor_id') THEN
        ALTER TABLE appointments DROP COLUMN doctor_id CASCADE;
    END IF;

    -- Financial
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'doctor_id') THEN
        ALTER TABLE financial_transactions DROP COLUMN doctor_id CASCADE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'recorded_by') THEN
        ALTER TABLE financial_transactions DROP COLUMN recorded_by CASCADE;
    END IF;

    -- Lab Orders
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_orders' AND column_name = 'dentist_id') THEN
         ALTER TABLE lab_orders DROP COLUMN dentist_id CASCADE;
    END IF;
    
    -- Lab Requests
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'lab_requests' AND column_name = 'doctor_id') THEN
         ALTER TABLE lab_requests DROP COLUMN doctor_id CASCADE;
    END IF;

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error during cleanup: %', SQLERRM;
END $$;
