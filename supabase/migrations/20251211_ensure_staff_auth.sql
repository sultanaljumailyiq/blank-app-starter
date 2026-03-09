-- Add auth columns to staff table if they don't exist
ALTER TABLE staff ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}'::jsonb;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'; -- Ensure status column exists as well

-- Policy to allow clinic owners to manage their staff
-- (Assuming RLS might block updates if not configured)
-- This is a safety measure.
