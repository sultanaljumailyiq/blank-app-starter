-- Create Storage Bucket named 'products' to match the frontend code
-- NOTE: This requires service_role access

-- Create products bucket (matching the code in SupplierProductModal)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'products', 
    'products', 
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- RLS Policies for products bucket - allow public read
DROP POLICY IF EXISTS "Allow public read products storage" ON storage.objects;
CREATE POLICY "Allow public read products storage" ON storage.objects FOR SELECT USING (bucket_id = 'products');

-- RLS Policies for products bucket - allow authenticated upload
DROP POLICY IF EXISTS "Allow authenticated upload products storage" ON storage.objects;
CREATE POLICY "Allow authenticated upload products storage" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'products');

-- RLS Policies for products bucket - allow authenticated update
DROP POLICY IF EXISTS "Allow authenticated update products storage" ON storage.objects;
CREATE POLICY "Allow authenticated update products storage" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'products');

-- RLS Policies for products bucket - allow authenticated delete
DROP POLICY IF EXISTS "Allow authenticated delete products storage" ON storage.objects;
CREATE POLICY "Allow authenticated delete products storage" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'products');
