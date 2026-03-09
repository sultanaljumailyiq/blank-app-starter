-- Link Staff to Auth Users
-- 2026-02-11

-- 1. Add user_id column to staff table
-- This allows us to link a staff record (Integer ID) to a system user (UUID)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff' AND column_name = 'user_id') THEN
        ALTER TABLE staff ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        CREATE INDEX idx_staff_user_id ON staff(user_id);
        RAISE NOTICE 'Added user_id to staff table.';
    END IF;
END $$;

-- 2. Add email uniqueness constraint (optional but good for mapping)
-- Staff email should ideally match User email if linked, but we won't enforce it strictly yet to avoid migration errors.

-- 3. Policy Update (Optional)
-- Ensure users can read their own staff record
DROP POLICY IF EXISTS "Users can view their own staff record" ON staff;
CREATE POLICY "Users can view their own staff record" ON staff
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR clinic_id IN (SELECT clinic_id FROM clinic_members WHERE user_id = auth.uid()));
