-- Create clinic_custom_labs if not exists
CREATE TABLE IF NOT EXISTS clinic_custom_labs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    specialties TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE clinic_custom_labs ENABLE ROW LEVEL SECURITY;

-- Allow access to clinic owners/members
CREATE POLICY "Clinics can manage their custom labs"
    ON clinic_custom_labs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM clinics c
            WHERE c.id = clinic_custom_labs.clinic_id
            AND (c.owner_id = auth.uid() OR 
                 EXISTS (SELECT 1 FROM clinic_members cm WHERE cm.clinic_id = c.id AND cm.user_id = auth.uid())
            )
        )
    );
