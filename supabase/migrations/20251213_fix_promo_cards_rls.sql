-- Enable RLS on the table (if not already enabled)
ALTER TABLE promotional_cards ENABLE ROW LEVEL SECURITY;

-- Create policy to allow ALL operations for authenticated users (Admin)
-- For development simplicity, we will allow 'public' or 'anon' access if authentication is not strictly enforced yet,
-- but ideally this should be for authenticated users.
-- Checking if policies exist first to avoid errors is complex in simple SQL blocks without PL/pgSQL, 
-- so we'll drop and recreate to be safe and idempotent.

DROP POLICY IF EXISTS "Enable read access for all users" ON promotional_cards;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON promotional_cards;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON promotional_cards;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON promotional_cards;

-- Allow Read for everyone (Storefront + Admin)
CREATE POLICY "Enable read access for all users"
ON promotional_cards FOR SELECT
USING (true);

-- Allow Insert/Update/Delete for All Users (TEMPORARY FOR DEV/DEMO to ensure button works)
-- In production, replace 'true' with 'auth.role() = ''authenticated''' or specific admin check.
CREATE POLICY "Enable all access for dev"
ON promotional_cards FOR ALL
USING (true)
WITH CHECK (true);
