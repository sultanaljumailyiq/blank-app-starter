-- Create models table if it doesn't exist (idempotent)
CREATE TABLE IF NOT EXISTS public.models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    embed_url TEXT NOT NULL, -- The Sketchfab or 3D viewer URL
    category TEXT,
    thumbnail_url TEXT,
    author TEXT DEFAULT 'Smart Dental',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

-- Policy: Allow everyone (public/anon + authenticated) to VIEW models
-- This resolves the issue where models don't appear in the Community section
DROP POLICY IF EXISTS "Models are sort of public" ON public.models;
DROP POLICY IF EXISTS "Public can view models" ON public.models;

CREATE POLICY "Public can view models" 
ON public.models FOR SELECT 
USING (true);

-- Policy: Allow authenticated users (Admins/Doctors) to INSERT/UPDATE/DELETE
-- In a stricter system, checking for role='admin' would be better, but for now allow auth users
DROP POLICY IF EXISTS "Admins can manage models" ON public.models;

CREATE POLICY "Admins can manage models" 
ON public.models FOR ALL 
USING (auth.role() = 'authenticated');
