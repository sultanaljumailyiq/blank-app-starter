-- 1. Ensure admin_settings table exists
CREATE TABLE IF NOT EXISTS admin_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Allow public read access to 'platform_config' (safe keys)
CREATE POLICY "Allow public read access to platform_config"
ON admin_settings FOR SELECT
TO public
USING (key = 'platform_config');

-- Allow admins full access
CREATE POLICY "Allow admins full access to settings"
ON admin_settings FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- 4. Storage for Platform Assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('platform-assets', 'platform-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access to Platform Assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'platform-assets');

CREATE POLICY "Admins can upload platform assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'platform-assets' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

CREATE POLICY "Admins can update platform assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'platform-assets' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

CREATE POLICY "Admins can delete platform assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'platform-assets' AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);
