-- Create resources table for Community section
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL, -- Link to PDF, Video, or external resource
    type TEXT DEFAULT 'document', -- 'document', 'video', 'link'
    category TEXT,
    thumbnail_url TEXT,
    downloads_count INTEGER DEFAULT 0,
    author TEXT DEFAULT 'Smart Dental',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view resources" 
ON public.resources FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage resources" 
ON public.resources FOR ALL 
USING (auth.role() = 'authenticated'); -- Or strictly admin check
