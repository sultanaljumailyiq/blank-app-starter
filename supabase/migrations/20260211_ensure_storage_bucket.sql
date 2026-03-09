-- Ensure 'patient-docs' bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-docs', 'patient-docs', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Public Read Access (Required for AI Analysis to read the image via public URL)
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'patient-docs' );

-- Policy: Authenticated Upload Access
CREATE POLICY "Authenticated Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'patient-docs' );

-- Policy: Authenticated Update/Delete Access (User can manage their own files)
CREATE POLICY "Authenticated Update/Delete Access"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'patient-docs' );

CREATE POLICY "Authenticated Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'patient-docs' );
