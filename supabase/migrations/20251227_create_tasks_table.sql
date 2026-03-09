-- Tasks and Reminders System

CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES auth.users(id),
  
  type VARCHAR(20) CHECK (type IN ('task', 'reminder')),
  title TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, overdue, urgent
  priority VARCHAR(20) DEFAULT 'medium', -- urgent, high, medium, low
  category VARCHAR(50), -- consultations, admin, supplies, etc.
  
  due_date DATE,
  due_time TIME,
  duration INTEGER DEFAULT 30, -- minutes
  
  -- Scopes (JSONB for flexibility: { type: 'all'|'specific', ids: [] })
  clinic_scope JSONB DEFAULT '{"type": "specific"}'::jsonb,
  assigned_scope JSONB DEFAULT '{"type": "specific"}'::jsonb,
  
  subtasks JSONB DEFAULT '[]'::jsonb, -- Array of strings or objects
  tags TEXT[] DEFAULT '{}',
  
  progress INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_clinic ON tasks(clinic_id);
CREATE INDEX idx_tasks_creator ON tasks(creator_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_date ON tasks(due_date);

-- RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see tasks for their clinic
CREATE POLICY "Users can view tasks in their clinic"
  ON tasks FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id FROM staff WHERE user_id = auth.uid()
      UNION
      SELECT id FROM clinics WHERE owner_id = auth.uid()
    )
  );

-- Policy: Users can create tasks if they are staff/admin
CREATE POLICY "Staff can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Policy: Users can update tasks in their clinic
CREATE POLICY "Users can update tasks in their clinic"
  ON tasks FOR UPDATE
  USING (
    clinic_id IN (
      SELECT clinic_id FROM staff WHERE user_id = auth.uid()
      UNION
      SELECT id FROM clinics WHERE owner_id = auth.uid()
    )
  );

-- Helper to extract user clinic (simplified for demo)
CREATE OR REPLACE FUNCTION get_my_clinic_id() 
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT clinic_id FROM staff WHERE user_id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
