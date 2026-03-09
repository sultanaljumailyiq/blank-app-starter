-- Fix suppliers table to support both user_id and profile_id lookups
-- Migration: 20260209_fix_suppliers_user_id.sql

-- Add user_id column if it doesn't exist (it should match profile_id from auth.users)
DO $$
BEGIN
    -- Check if user_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'suppliers' AND column_name = 'user_id'
    ) THEN
        -- Add user_id column
        ALTER TABLE suppliers ADD COLUMN user_id UUID REFERENCES profiles(id);
        
        -- Copy profile_id to user_id where profile_id exists
        UPDATE suppliers SET user_id = profile_id WHERE profile_id IS NOT NULL;
        
        -- Create index for faster lookups
        CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON suppliers(user_id);
        
        RAISE NOTICE 'Added user_id column to suppliers table';
    ELSE
        RAISE NOTICE 'user_id column already exists in suppliers table';
    END IF;
END $$;

-- Ensure we have both columns for compatibility
-- If profile_id doesn't exist but user_id does, add profile_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'suppliers' AND column_name = 'profile_id'
    ) THEN
        ALTER TABLE suppliers ADD COLUMN profile_id UUID REFERENCES profiles(id);
        UPDATE suppliers SET profile_id = user_id WHERE user_id IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_suppliers_profile_id ON suppliers(profile_id);
        RAISE NOTICE 'Added profile_id column to suppliers table';
    END IF;
END $$;

-- Sync user_id and profile_id for any mismatched rows
UPDATE suppliers 
SET user_id = profile_id 
WHERE user_id IS NULL AND profile_id IS NOT NULL;

UPDATE suppliers 
SET profile_id = user_id 
WHERE profile_id IS NULL AND user_id IS NOT NULL;
