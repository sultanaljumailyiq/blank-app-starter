
-- Add clinic_id to activity_logs for better filtering
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'clinic_id') THEN
        ALTER TABLE activity_logs ADD COLUMN clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update RLS to allow doctors to see logs for their clinics
DROP POLICY IF EXISTS "Members can view activity logs for their clinic" ON activity_logs;
CREATE POLICY "Members can view activity logs for their clinic" ON activity_logs
    FOR SELECT
    USING (
        clinic_id IN (
            SELECT clinic_id FROM staff WHERE user_id = auth.uid()
            UNION
            SELECT id FROM clinics WHERE owner_id = auth.uid()
        )
    );
