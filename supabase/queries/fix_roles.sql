-- Fix missing 'laboratory' role in profiles constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles 
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('admin', 'doctor', 'supplier', 'laboratory'));

-- Ensure RLS is still correct (no changes needed if using is_admin function)
