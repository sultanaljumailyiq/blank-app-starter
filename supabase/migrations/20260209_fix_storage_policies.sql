-- Fix Storage Bucket RLS Policies for products bucket
-- This ensures authenticated users can upload/read product images

-- First, ensure the bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'products', 
    'products', 
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop ALL existing policies for products bucket to start fresh
DO $$
DECLARE
    policy_name TEXT;
BEGIN
    FOR policy_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage'
        AND policyname LIKE '%product%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_name);
    END LOOP;
END $$;

-- Create simple, permissive policies for products bucket

-- Allow anyone to SELECT (read) from products bucket (public)
CREATE POLICY "Public read products bucket" ON storage.objects
    FOR SELECT USING (bucket_id = 'products');

-- Allow authenticated users to INSERT (upload) to products bucket
CREATE POLICY "Authenticated upload products bucket" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'products');

-- Allow authenticated users to UPDATE objects in products bucket
CREATE POLICY "Authenticated update products bucket" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'products');

-- Allow authenticated users to DELETE from products bucket
CREATE POLICY "Authenticated delete products bucket" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'products');
