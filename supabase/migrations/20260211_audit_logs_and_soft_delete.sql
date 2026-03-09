-- Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Who performed the action
    action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'restore'
    entity_type TEXT NOT NULL, -- 'staff', 'patient', 'appointment', 'transaction'
    entity_id UUID NOT NULL,
    details JSONB DEFAULT '{}'::jsonb, -- Store old/new values
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies for activity_logs
CREATE POLICY "Clinic owners can view logs for their clinic" ON public.activity_logs
    FOR SELECT USING (
        clinic_id IN (
            SELECT id FROM public.clinics 
            WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Staff with activityLog permission can view logs" ON public.activity_logs
    FOR SELECT USING (
        clinic_id IN (
            SELECT clinic_id FROM public.staff 
            WHERE auth_user_id = auth.uid() 
            AND (permissions->>'activityLog')::boolean = true
        )
    );

CREATE POLICY "Authenticated users can insert logs" ON public.activity_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add deleted_at column for Soft Delete to relevant tables
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Update RLS Policies to exclude deleted items by default types
-- Note: This requires updating existing policies or handling it in the application query layer.
-- For now, we will handle it in the application layer (filtering is null).

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_clinic_id ON public.activity_logs(clinic_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
