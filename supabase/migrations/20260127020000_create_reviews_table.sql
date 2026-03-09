-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    
    -- Optional: Add status for moderation if needed later
    is_approved BOOLEAN DEFAULT TRUE,
    
    UNIQUE(product_id, user_id) -- One review per user per product
);

-- RLS Policies
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read reviews
CREATE POLICY "Everyone can read reviews" ON public.reviews
    FOR SELECT
    USING (true);

-- Policy: Authenticated users can insert reviews
CREATE POLICY "Authenticated users can create reviews" ON public.reviews
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own reviews
CREATE POLICY "Users can update their own reviews" ON public.reviews
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews" ON public.reviews
    FOR DELETE
    USING (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
