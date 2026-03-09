-- Fix suppliers table RLS policies to allow admin updates
-- Run this in Supabase SQL Editor

-- First, check for any triggers on suppliers table
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'suppliers';

-- Drop restrictive policies and recreate permissive ones
DROP POLICY IF EXISTS "Allow admin to update suppliers" ON suppliers;
DROP POLICY IF EXISTS "suppliers_update_policy" ON suppliers;

-- Enable RLS if not already enabled
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read suppliers
DROP POLICY IF EXISTS "Allow read suppliers" ON suppliers;
CREATE POLICY "Allow read suppliers" ON suppliers
  FOR SELECT TO authenticated
  USING (true);

-- Allow authenticated users to update suppliers (for admin operations)
CREATE POLICY "Allow admin to update suppliers" ON suppliers
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow insert for authenticated users
DROP POLICY IF EXISTS "Allow insert suppliers" ON suppliers;
CREATE POLICY "Allow insert suppliers" ON suppliers
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Also fix profiles table if needed (in case trigger references it)
DROP POLICY IF EXISTS "Allow admin to update profiles" ON profiles;
CREATE POLICY "Allow admin to update profiles" ON profiles
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON suppliers TO authenticated;
GRANT ALL ON profiles TO authenticated;

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'suppliers';
