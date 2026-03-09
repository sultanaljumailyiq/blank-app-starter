-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- e.g., 'user_register', 'order_complete', 'payment'
    user_id UUID REFERENCES auth.users(id),
    user_name VARCHAR(255),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all logs
CREATE POLICY "Admins can read all activity logs" ON activity_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Allow system to insert logs (service role or authenticated users performing actions)
CREATE POLICY "Users can insert activity logs" ON activity_logs
    FOR INSERT
    WITH CHECK (true);

-- Add is_featured to clinics
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add RLS policy for public to view featured clinics (if needed for filtering)
-- Existing policies usually allow reading clinics, but good to ensure.

-- Fix Educational Articles RLS (if needed)
-- Ensure public read access
DROP POLICY IF EXISTS "Public can view published articles" ON articles;
CREATE POLICY "Public can view published articles" ON articles
    FOR SELECT
    USING (is_published = true);
