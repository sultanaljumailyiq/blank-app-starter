-- Add target_audience to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS target_audience text[] DEFAULT ARRAY['clinic', 'lab', 'both'];

-- Update existing products to have a default (e.g., 'both' or specific based on category if possible, but 'both' is safe)
UPDATE public.products 
SET target_audience = ARRAY['clinic', 'lab'] 
WHERE target_audience IS NULL;

-- Create an index for faster filtering (Gin index for array)
CREATE INDEX IF NOT EXISTS idx_products_target_audience ON public.products USING GIN (target_audience);
