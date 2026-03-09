-- Create a public bucket for clinic images
INSERT INTO storage.buckets (id, name, public)
VALUES ('clinics', 'clinics', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'clinics' );

-- Policy to allow public to view images
CREATE POLICY "Allow public viewing"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'clinics' );
