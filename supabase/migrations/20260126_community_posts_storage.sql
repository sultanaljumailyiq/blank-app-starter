-- Create community-posts bucket for post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-posts', 'community-posts', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for community-posts
DROP POLICY IF EXISTS "Public Access Community Posts Images" ON storage.objects;
CREATE POLICY "Public Access Community Posts Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'community-posts' );

DROP POLICY IF EXISTS "Auth Users Upload Post Images" ON storage.objects;
CREATE POLICY "Auth Users Upload Post Images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'community-posts' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Auth Users Delete Own Post Images" ON storage.objects;
CREATE POLICY "Auth Users Delete Own Post Images"
ON storage.objects FOR DELETE
USING ( bucket_id = 'community-posts' AND auth.uid()::text = (storage.foldername(name))[1] );
