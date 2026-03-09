-- Create model_sources table
CREATE TABLE IF NOT EXISTS public.model_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'sketchfab_collection', -- e.g. 'sketchfab_collection', 'sketchfab_user'
    is_active BOOLEAN DEFAULT true,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    model_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.model_sources ENABLE ROW LEVEL SECURITY;

-- Policy: Admin only for now (or authenticated)
CREATE POLICY "Admins can manage sources" 
ON public.model_sources FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view sources" 
ON public.model_sources FOR SELECT 
USING (true);

-- Seed Default Collection
INSERT INTO public.model_sources (name, url, is_active)
VALUES 
    ('مجموعة طب الأسنان (أساسي)', 'https://sketchfab.com/Sultan.Aljumaily/collections/dental-and-medical-4b03959643004743b85e67fae10e0', true)
ON CONFLICT DO NOTHING;
