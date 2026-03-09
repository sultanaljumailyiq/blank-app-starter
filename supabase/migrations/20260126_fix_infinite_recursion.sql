-- FIX: Infinite Recursion in RLS Policies
-- This script creates a security definer function to check admin status without triggering RLS loop.

-- 1. Create a helper function to check if user is admin
-- SECURITY DEFINER means it runs with the privileges of the creator (postgres), bypassing RLS.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 2. UPDATE PROFILES POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "profiles_admin_read" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;

CREATE POLICY "profiles_admin_read" ON profiles FOR SELECT
TO authenticated
USING (
    -- User can see their own profile
    id = auth.uid()
    OR
    -- Admin can see ALL profiles (using function to avoid recursion)
    is_admin()
);

CREATE POLICY "profiles_admin_update" ON profiles FOR UPDATE
TO authenticated
USING (
    -- User can update their own profile
    id = auth.uid()
    OR
    -- Admin can update ALL profiles
    is_admin()
);

-- ==============================================================================
-- 3. UPDATE CLINICS POLICIES (Optional but good practice)
-- ==============================================================================

DROP POLICY IF EXISTS "clinics_select_policy" ON clinics;

CREATE POLICY "clinics_select_policy" ON clinics FOR SELECT
TO authenticated
USING (
    owner_id = auth.uid()
    OR
    -- Use the helper function here too for cleaner code
    is_admin()
    OR
    is_active = true
);

-- ==============================================================================
-- 4. UPDATE SUBSCRIPTION REQUESTS POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "subscription_requests_admin_read" ON subscription_requests;
DROP POLICY IF EXISTS "subscription_requests_admin_update" ON subscription_requests;

CREATE POLICY "subscription_requests_admin_read" ON subscription_requests FOR SELECT
TO authenticated
USING (
    doctor_id = auth.uid()
    OR
    is_admin()
);

CREATE POLICY "subscription_requests_admin_update" ON subscription_requests FOR UPDATE
TO authenticated
USING (
    is_admin()
);

-- ==============================================================================
-- 5. UPDATE SUBSCRIPTION PLANS POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "v2_admins_manage_plans" ON subscription_plans;

CREATE POLICY "v2_admins_manage_plans" 
ON subscription_plans FOR ALL 
USING (
    is_admin()
);

-- ==============================================================================
-- 6. UPDATE COUPONS POLICIES
-- ==============================================================================

DROP POLICY IF EXISTS "v2_admins_manage_coupons" ON coupons;

CREATE POLICY "v2_admins_manage_coupons" 
ON coupons FOR ALL 
USING (
    is_admin()
);
