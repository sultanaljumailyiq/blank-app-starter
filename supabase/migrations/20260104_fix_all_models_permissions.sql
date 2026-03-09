-- 1. Ensure Tables Exist
CREATE TABLE IF NOT EXISTS public.models (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    embed_url TEXT NOT NULL,
    category TEXT,
    thumbnail_url TEXT,
    author TEXT DEFAULT 'Smart Dental',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.model_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'sketchfab_collection',
    is_active BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    model_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Force Enable RLS
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_sources ENABLE ROW LEVEL SECURITY;

-- 3. Reset Policies (Clean Slate)
DROP POLICY IF EXISTS "Public can view models" ON public.models;
DROP POLICY IF EXISTS "Admins can manage models" ON public.models;
DROP POLICY IF EXISTS "Public can view sources" ON public.model_sources;
DROP POLICY IF EXISTS "Admins can manage sources" ON public.model_sources;

-- 4. Create Permissive Policies
-- MODELS: Public View, Auth Manage (All operations including DELETE)
CREATE POLICY "Public can view models" 
ON public.models FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage models" 
ON public.models FOR ALL 
USING (auth.role() = 'authenticated');


-- MODEL SOURCES: Public View, Auth Manage
CREATE POLICY "Public can view sources" 
ON public.model_sources FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage sources" 
ON public.model_sources FOR ALL 
USING (auth.role() = 'authenticated');

-- 5. Seed Default Source (Upsert)
-- We check if the URL exists to avoid duplicates
INSERT INTO public.model_sources (name, url, is_active)
SELECT 'مجموعة طب الأسنان (أساسي)', 'https://sketchfab.com/Sultan.Aljumaily/collections/dental-and-medical-4b03959643004743b85e67fae10e00f4', true
WHERE NOT EXISTS (
    SELECT 1 FROM public.model_sources WHERE url = 'https://sketchfab.com/Sultan.Aljumaily/collections/dental-and-medical-4b03959643004743b85e67fae10e00f4'
);
