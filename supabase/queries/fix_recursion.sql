-- Fix Infinite Recursion in RLS
-- 1. Create helper function (SECURITY DEFINER breaks the RLS loop)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop old policies
DROP POLICY IF EXISTS "Allow admins full access to profiles" ON profiles;

-- 3. Re-create safe policy
CREATE POLICY "Allow admins full access to profiles" ON profiles 
FOR ALL TO authenticated 
USING (is_admin());
