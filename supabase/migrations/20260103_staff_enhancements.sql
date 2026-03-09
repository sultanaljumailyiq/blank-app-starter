-- Migration to add Staff Permissions and Credentials support

-- 1. Add status column for granular status tracking (active, on_leave, suspended, terminated)
ALTER TABLE staff ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- 2. Add permissions column (JSONB) to store granular access rights
ALTER TABLE staff ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '{
  "activityLog": false,
  "assets": false,
  "staff": false,
  "lab": false,
  "appointments": false,
  "patients": false,
  "financials": false,
  "settings": false,
  "reports": false
}'::jsonb;

-- 3. Add Username and Password (Encrypted/Hashed ideally, but text for now as requested)
ALTER TABLE staff ADD COLUMN IF NOT EXISTS username text;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS password text; -- In a real app, use auth.users. This is for the requested simplistic custom auth.

-- 4. Sync existing is_active with status
UPDATE staff SET status = 'active' WHERE is_active = true AND status IS NULL;
UPDATE staff SET status = 'suspended' WHERE is_active = false AND status IS NULL;
