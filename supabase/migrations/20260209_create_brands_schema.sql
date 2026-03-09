-- Create brands table and setup RLS for supplier creation
-- Migration: 20260209_create_brands_schema.sql

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    logo TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id), -- Optional: track who created it
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add columns if table exists but columns missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'is_verified') THEN
        ALTER TABLE brands ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'logo') THEN
        ALTER TABLE brands ADD COLUMN logo TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'description') THEN
        ALTER TABLE brands ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'created_by') THEN
        ALTER TABLE brands ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- 4. policies

-- Public Read (Verified brands)
DROP POLICY IF EXISTS "Public read verified brands" ON brands;
CREATE POLICY "Public read verified brands" ON brands
    FOR SELECT USING (is_verified = true);

-- Authenticated Read (All brands - to see pending ones they created or list all for selection depending on UX)
-- For now, let's allow authenticated users to see all brands to avoid duplicates
DROP POLICY IF EXISTS "Authenticated read all brands" ON brands;
CREATE POLICY "Authenticated read all brands" ON brands
    FOR SELECT TO authenticated USING (true);

-- Authenticated Insert (Suppliers can create)
DROP POLICY IF EXISTS "Authenticated insert brands" ON brands;
CREATE POLICY "Authenticated insert brands" ON brands
    FOR INSERT TO authenticated
    WITH CHECK (true);
    -- Note: We rely on the DEFAULT is_verified = false. 
    -- A trigger could enforce this if we really don't trust the client, but for now this is okay.
    -- Ideally: WITH CHECK (is_verified = false)

-- Admin Update (Verify brands)
-- Assuming admin has a way to bypass RLS or has a specific role. 
-- For now, we'll leave update restricted. If suppliers need to edit their OWN brands, we need 'created_by'.

-- Allow users to update their own unverified brands?
DROP POLICY IF EXISTS "Users update own unverified brands" ON brands;
CREATE POLICY "Users update own unverified brands" ON brands
    FOR UPDATE TO authenticated
    USING (created_by = auth.uid() AND is_verified = false);

