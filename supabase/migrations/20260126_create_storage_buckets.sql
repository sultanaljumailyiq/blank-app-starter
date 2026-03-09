-- Create platform-assets bucket for Admin QR codes
INSERT INTO storage.buckets (id, name, public)
VALUES ('platform-assets', 'platform-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create documents bucket for User Receipts
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for platform-assets
CREATE POLICY "Public Access Platform Assets"
ON storage.objects FOR SELECT
USING ( bucket_id = 'platform-assets' );

CREATE POLICY "Auth Users Upload Platform Assets"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'platform-assets' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Users Update Platform Assets"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'platform-assets' AND auth.role() = 'authenticated' );

-- RLS Policies for documents
CREATE POLICY "Public Access Documents"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documents' );

CREATE POLICY "Auth Users Upload Documents"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'documents' AND auth.role() = 'authenticated' );
