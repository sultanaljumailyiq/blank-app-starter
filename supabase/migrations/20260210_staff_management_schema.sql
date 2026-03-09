-- Add auth_user_id to staff table to link with Supabase Auth
ALTER TABLE staff 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- Create clinic_tasks table
CREATE TABLE IF NOT EXISTS clinic_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id BIGINT REFERENCES clinics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to INTEGER REFERENCES staff(id) ON DELETE SET NULL, -- specific staff member
    created_by UUID REFERENCES auth.users(id), -- owner or admin who created it
    due_date TIMESTAMPTZ,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on clinic_tasks
ALTER TABLE clinic_tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for clinic_tasks
-- Owners can view/edit all tasks in their clinics
CREATE POLICY "Owners can manage tasks in their clinics" ON clinic_tasks
    FOR ALL
    USING (
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid()
        )
    );

-- Staff can view tasks assigned to them OR all tasks in their clinic (if we allow open tasks)
-- For now, let's allow staff to see all tasks in their clinic to enable collaboration
CREATE POLICY "Staff can view tasks in their clinic" ON clinic_tasks
    FOR SELECT
    USING (
        clinic_id IN (
            SELECT clinic_id FROM staff WHERE auth_user_id = auth.uid()
        )
    );

-- Staff can update tasks assigned to them (e.g. mark as complete)
CREATE POLICY "Staff can update assigned tasks" ON clinic_tasks
    FOR UPDATE
    USING (
        clinic_id IN (
            SELECT clinic_id FROM staff WHERE auth_user_id = auth.uid()
        )
    );

-- Create clinic_messages table for internal staff chat
CREATE TABLE IF NOT EXISTS clinic_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id BIGINT REFERENCES clinics(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id), -- Auth user ID (owner or staff)
    sender_type TEXT CHECK (sender_type IN ('owner', 'staff')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on clinic_messages
ALTER TABLE clinic_messages ENABLE ROW LEVEL SECURITY;

-- Policy for clinic_messages
CREATE POLICY "Clinic members can view messages" ON clinic_messages
    FOR SELECT
    USING (
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid() -- Owner
            UNION
            SELECT clinic_id FROM staff WHERE auth_user_id = auth.uid() -- Staff
        )
    );

CREATE POLICY "Clinic members can send messages" ON clinic_messages
    FOR INSERT
    WITH CHECK (
        clinic_id IN (
            SELECT id FROM clinics WHERE owner_id = auth.uid() -- Owner
            UNION
            SELECT clinic_id FROM staff WHERE auth_user_id = auth.uid() -- Staff
        )
    );
