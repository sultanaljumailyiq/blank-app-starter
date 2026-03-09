-- Create articles table
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    image_url TEXT,
    
    author TEXT, -- Could be text or UUID (profile_id)
    category TEXT,
    
    date DATE DEFAULT CURRENT_DATE,
    
    is_published BOOLEAN DEFAULT FALSE,
    views INTEGER DEFAULT 0
);

-- RLS Policies
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read published articles
CREATE POLICY "Everyone can read published articles" ON public.articles
    FOR SELECT
    USING (is_published = true);

-- Policy: Admins can read all (assuming role logic or simple check)
-- For now, let's allow authenticated to read all for simplicity, or stick to published
-- But editors need to see drafts.

-- Policy: Only Authenticated Users (Admins/Editors) can insert/update/delete
-- Since we don't have robust RBAC for content yet, we'll restrict to authenticated for now
-- and rely on app logic or future RBAC updates.
CREATE POLICY "Authenticated users can manage articles" ON public.articles
    FOR ALL
    USING (auth.uid() IS NOT NULL);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.articles;
