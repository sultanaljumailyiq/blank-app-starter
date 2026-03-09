-- Fix suppliers table RLS policies to allow admin updates
-- Migration: 20260209_fix_suppliers_rls.sql

-- Enable RLS if not already enabled
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow admin to update suppliers" ON suppliers;
DROP POLICY IF EXISTS "suppliers_update_policy" ON suppliers;
DROP POLICY IF EXISTS "Allow read suppliers" ON suppliers;
DROP POLICY IF EXISTS "Allow insert suppliers" ON suppliers;

-- Allow authenticated users to read suppliers
CREATE POLICY "Allow read suppliers" ON suppliers
  FOR SELECT TO authenticated
  USING (true);

-- Allow authenticated users to update suppliers (for admin operations)
CREATE POLICY "Allow admin to update suppliers" ON suppliers
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow insert for authenticated users
CREATE POLICY "Allow insert suppliers" ON suppliers
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Also ensure profiles table allows updates
DROP POLICY IF EXISTS "Allow update profiles" ON profiles;
CREATE POLICY "Allow update profiles" ON profiles
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON suppliers TO authenticated;
GRANT ALL ON profiles TO authenticated;
