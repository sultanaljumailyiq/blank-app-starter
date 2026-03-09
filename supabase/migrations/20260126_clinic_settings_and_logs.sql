-- Add settings columns to clinics table
ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS is_digital_booking BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS commission_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS blue_badge_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic staff can view logs" ON activity_logs
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM staff s 
        WHERE s.user_id = auth.uid() 
        AND s.clinic_id = activity_logs.clinic_id
    )
    OR 
    EXISTS (
        SELECT 1 FROM clinics c
        WHERE c.owner_id = auth.uid()
        AND c.id = activity_logs.clinic_id
    )
);

CREATE POLICY "System can create logs" ON activity_logs
FOR INSERT WITH CHECK (true);

-- Verify
SELECT column_name FROM information_schema.columns WHERE table_name = 'clinics' AND column_name IN ('settings', 'is_digital_booking');
SELECT 'activity_logs' as table, EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_logs') as exists;
