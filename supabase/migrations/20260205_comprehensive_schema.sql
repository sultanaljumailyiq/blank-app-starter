-- 1. STAFF TABLE
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL, -- Assuming clinics table exists or just for grouping
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role_title TEXT NOT NULL DEFAULT 'doctor', -- doctor, assistant, etc
    
    -- Auth & Status
    username TEXT,
    password TEXT, -- Stored as text per user request/current implementation (NOT SECURE for real auth, temporary)
    is_active BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active', -- active, on_leave, etc
    
    -- Profile Data
    department TEXT,
    salary NUMERIC DEFAULT 0,
    join_date DATE DEFAULT CURRENT_DATE,
    address TEXT,
    image_url TEXT,
    notes TEXT,
    
    -- JSONB Structured Data
    work_schedule JSONB DEFAULT '{"days": [], "startTime": "09:00", "endTime": "17:00"}'::jsonb,
    permissions JSONB DEFAULT '{}'::jsonb,
    performance_stats JSONB DEFAULT '{}'::jsonb,
    attendance_stats JSONB DEFAULT '{}'::jsonb,
    
    -- Arrays
    skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    languages TEXT[] DEFAULT ARRAY[]::TEXT[],
    qualifications TEXT[] DEFAULT ARRAY[]::TEXT[],
    certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Staff
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read staff" ON staff;
CREATE POLICY "Public read staff" ON staff FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated insert staff" ON staff;
CREATE POLICY "Authenticated insert staff" ON staff FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated update staff" ON staff;
CREATE POLICY "Authenticated update staff" ON staff FOR UPDATE USING (true);

-- Ensure columns exist (for existing tables)
ALTER TABLE staff ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE staff ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS work_schedule JSONB DEFAULT '{"days": [], "startTime": "09:00", "endTime": "17:00"}'::jsonb;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS attendance_stats JSONB DEFAULT '{}'::jsonb;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS performance_stats JSONB DEFAULT '{}'::jsonb;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS clinic_id UUID; -- Ensure clinic_id exists


-- 2. TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'task', -- task, reminder
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed, overdue
    priority TEXT DEFAULT 'medium', -- urgent, high, medium, low
    category TEXT DEFAULT 'general',
    
    -- Timing
    due_date DATE,
    due_time TEXT,
    duration INTEGER DEFAULT 30,
    
    -- Scoping (JSONB for flexibility)
    clinic_scope JSONB DEFAULT '{"type": "all"}'::jsonb, 
    assigned_scope JSONB DEFAULT '{"type": "all"}'::jsonb, 
    
    -- Metadata
    creator_id UUID,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    subtasks TEXT[] DEFAULT ARRAY[]::TEXT[],
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read tasks" ON tasks;
CREATE POLICY "Public read tasks" ON tasks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated insert tasks" ON tasks;
CREATE POLICY "Authenticated insert tasks" ON tasks FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated update tasks" ON tasks;
CREATE POLICY "Authenticated update tasks" ON tasks FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Authenticated delete tasks" ON tasks;
CREATE POLICY "Authenticated delete tasks" ON tasks FOR DELETE USING (true);


-- 3. PATIENTS TABLE UPDATES
-- Ensure medical_history_data exists
ALTER TABLE patients ADD COLUMN IF NOT EXISTS medical_history_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS clinic_id UUID;
