-- Fix RLS policies for Admin access to clinics and related data
-- This migration ensures that Admins can read ALL data for the OwnerDetailsModal

-- ==============================================================================
-- 1. CLINICS TABLE - Allow Admins to read ALL clinics
-- ==============================================================================

-- Drop conflicting policies
DROP POLICY IF EXISTS "Users can view their own clinics" ON clinics;
DROP POLICY IF EXISTS "Allow public read access to active clinics" ON clinics;

-- Create comprehensive read policy for clinics
DROP POLICY IF EXISTS "clinics_select_policy" ON clinics;
CREATE POLICY "clinics_select_policy" ON clinics FOR SELECT
TO authenticated
USING (
    -- Owner can see their clinics
    owner_id = auth.uid()
    OR
    -- Admin can see ALL clinics
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR
    -- Public can see active clinics (for booking pages etc)
    is_active = true
);

-- ==============================================================================
-- 2. SUBSCRIPTION_REQUESTS TABLE - Allow Admins to read ALL subscription requests
-- ==============================================================================

DROP POLICY IF EXISTS "Admin can read all subscription requests" ON subscription_requests;

DROP POLICY IF EXISTS "subscription_requests_admin_read" ON subscription_requests;
CREATE POLICY "subscription_requests_admin_read" ON subscription_requests FOR SELECT
TO authenticated
USING (
    -- Doctor can see their own requests
    doctor_id = auth.uid()
    OR
    -- Admin can see ALL requests
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Allow admin to update subscription requests
DROP POLICY IF EXISTS "Admin can update subscription requests" ON subscription_requests;
DROP POLICY IF EXISTS "subscription_requests_admin_update" ON subscription_requests;
CREATE POLICY "subscription_requests_admin_update" ON subscription_requests FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- ==============================================================================
-- 3. PROFILES TABLE - Allow Admins to read and update ALL profiles
-- ==============================================================================

DROP POLICY IF EXISTS "Admin can read all profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_read" ON profiles;
CREATE POLICY "profiles_admin_read" ON profiles FOR SELECT
TO authenticated
USING (
    -- User can see their own profile
    id = auth.uid()
    OR
    -- Admin can see ALL profiles
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

DROP POLICY IF EXISTS "Admin can update all profiles" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
CREATE POLICY "profiles_admin_update" ON profiles FOR UPDATE
TO authenticated
USING (
    -- User can update their own profile
    id = auth.uid()
    OR
    -- Admin can update ALL profiles (for account status changes)
    EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    )
);

-- Notify completion
DO $$ BEGIN RAISE NOTICE 'Admin RLS policies applied successfully.'; END $$;
