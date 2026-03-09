-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('task', 'reminder')) DEFAULT 'task',
    
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue', 'urgent')) DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('urgent', 'high', 'medium', 'low')) DEFAULT 'medium',
    category TEXT,
    
    due_date DATE,
    due_time TIME,
    duration INTEGER DEFAULT 30, -- in minutes
    
    creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    clinic_id BIGINT REFERENCES public.clinics(id) ON DELETE CASCADE, -- Optional direct link to a single clinic context
    
    -- Scopes (stored as JSONB for flexibility matching the UI objects)
    clinic_scope JSONB DEFAULT '{"type": "all"}'::JSONB, 
    assigned_scope JSONB DEFAULT '{"type": "all"}'::JSONB,
    
    subtasks JSONB DEFAULT '[]'::JSONB,
    tags JSONB DEFAULT '[]'::JSONB,
    notes TEXT
);

-- RLS Policies
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view tasks they created OR tasks assigned to them OR tasks in their clinic scope
CREATE POLICY "Users can view relevant tasks" ON public.tasks
    FOR SELECT
    USING (
        auth.uid() = creator_id 
        OR 
        (assigned_scope->>'type' = 'all') 
        OR 
        (assigned_scope->'ids' ? auth.uid()::text)
    );

-- Policy: Creators can update their tasks
CREATE POLICY "Creators can update their tasks" ON public.tasks
    FOR UPDATE
    USING (auth.uid() = creator_id);

-- Policy: Assignees can update status (simplified for now, ideally strictly status columns)
CREATE POLICY "Assignees can update status" ON public.tasks
    FOR UPDATE
    USING (
        (assigned_scope->>'type' = 'all') 
        OR 
        (assigned_scope->'ids' ? auth.uid()::text)
    );

-- Policy: Creators can delete their tasks
CREATE POLICY "Creators can delete their tasks" ON public.tasks
    FOR DELETE
    USING (auth.uid() = creator_id);

-- Policy: Everyone can insert (authenticated)
CREATE POLICY "Users can create tasks" ON public.tasks
    FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
