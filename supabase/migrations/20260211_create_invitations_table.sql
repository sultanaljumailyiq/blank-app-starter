-- Migration: Create Clinic Invitations Table & Update Staff for Linking

-- 1. Create Invitations Table
CREATE TABLE IF NOT EXISTS clinic_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'doctor', -- 'doctor', 'nurse', 'receptionist'
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add is_linked_account to Staff
ALTER TABLE staff 
ADD COLUMN IF NOT EXISTS is_linked_account BOOLEAN DEFAULT FALSE;

-- 3. RLS Policies for Invitations

-- Enable RLS
ALTER TABLE clinic_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Clinic Owners can VIEW invitations they created
CREATE POLICY "Owners can view their clinic invitations" 
ON clinic_invitations FOR SELECT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM clinics 
        WHERE id = clinic_invitations.clinic_id 
        AND owner_id = auth.uid()
    )
);

-- Policy: Clinic Owners can CREATE invitations for their clinic
CREATE POLICY "Owners can create invitations" 
ON clinic_invitations FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM clinics 
        WHERE id = clinic_invitations.clinic_id 
        AND owner_id = auth.uid()
    )
);

-- Policy: Clinic Owners can DELETE invitations
CREATE POLICY "Owners can delete invitations" 
ON clinic_invitations FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM clinics 
        WHERE id = clinic_invitations.clinic_id 
        AND owner_id = auth.uid()
    )
);

-- Policy: Invited Doctors can VIEW their own invitations (by Email)
-- Note: This requires the user to be logged in with that email.
CREATE POLICY "Users can view invitations sent to their email" 
ON clinic_invitations FOR SELECT 
TO authenticated 
USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Policy: Invited Doctors can UPDATE status (Accept/Reject)
CREATE POLICY "Users can accept/reject invitations" 
ON clinic_invitations FOR UPDATE 
TO authenticated 
USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
)
WITH CHECK (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
);
