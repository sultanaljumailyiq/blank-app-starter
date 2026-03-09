-- CRITICAL FIX: Infinite Recursion in RLS Policies
-- This migration MUST be applied to fix the infinite recursion error.
-- It drops all conflicting policies and recreates them using the is_admin() function.

-- ==============================================================================
-- 1. Ensure is_admin() function exists with SECURITY DEFINER
-- ==============================================================================
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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create similar helper for doctor check
CREATE OR REPLACE FUNCTION public.is_doctor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND role = 'doctor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper to check clinic ownership (avoids recursion in clinic-based policies)
CREATE OR REPLACE FUNCTION public.user_clinic_ids()
RETURNS SETOF INTEGER AS $$
BEGIN
  RETURN QUERY SELECT id FROM clinics WHERE owner_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==============================================================================
-- 2. FIX PROFILES TABLE POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "profiles_admin_read" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;

-- Simple, non-recursive SELECT policy
CREATE POLICY "profiles_select_v2" ON profiles FOR SELECT
TO authenticated
USING (
    id = auth.uid() OR is_admin()
);

-- Simple, non-recursive UPDATE policy
CREATE POLICY "profiles_update_v2" ON profiles FOR UPDATE
TO authenticated
USING (
    id = auth.uid() OR is_admin()
);

-- Allow insert during sign-up
CREATE POLICY "profiles_insert_v2" ON profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- ==============================================================================
-- 3. FIX CLINICS TABLE POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "clinics_select_policy" ON clinics;
DROP POLICY IF EXISTS "Users can view their own clinics" ON clinics;
DROP POLICY IF EXISTS "Users can create their own clinics" ON clinics;
DROP POLICY IF EXISTS "Users can update their own clinics" ON clinics;
DROP POLICY IF EXISTS "Users can delete their own clinics" ON clinics;
DROP POLICY IF EXISTS "Allow public read access to active clinics" ON clinics;
DROP POLICY IF EXISTS "Allow owners and admins to update clinics" ON clinics;
DROP POLICY IF EXISTS "Allow admins to insert clinics" ON clinics;
DROP POLICY IF EXISTS "Allow admins to delete clinics" ON clinics;
DROP POLICY IF EXISTS "Owners can view their clinics" ON clinics;
DROP POLICY IF EXISTS "Doctors and admins can create clinics" ON clinics;
DROP POLICY IF EXISTS "Owners and admins can update clinics" ON clinics;
DROP POLICY IF EXISTS "Owners and admins can delete clinics" ON clinics;

-- SELECT: Owners, admins, or public active
CREATE POLICY "clinics_select_v2" ON clinics FOR SELECT
USING (
    owner_id = auth.uid() 
    OR is_admin()
    OR is_active = true
);

-- INSERT: Doctors and admins
CREATE POLICY "clinics_insert_v2" ON clinics FOR INSERT
TO authenticated
WITH CHECK (
    is_doctor() OR is_admin()
);

-- UPDATE: Owners and admins
CREATE POLICY "clinics_update_v2" ON clinics FOR UPDATE
TO authenticated
USING (
    owner_id = auth.uid() OR is_admin()
);

-- DELETE: Owners and admins
CREATE POLICY "clinics_delete_v2" ON clinics FOR DELETE
TO authenticated
USING (
    owner_id = auth.uid() OR is_admin()
);

-- ==============================================================================
-- 4. FIX PATIENTS TABLE POLICIES (using function to avoid recursion)
-- ==============================================================================
DROP POLICY IF EXISTS "Clinic owners can view their patients" ON patients;
DROP POLICY IF EXISTS "Clinic owners can create patients" ON patients;
DROP POLICY IF EXISTS "Clinic owners can update patients" ON patients;
DROP POLICY IF EXISTS "Clinic owners can delete patients" ON patients;

CREATE POLICY "patients_select_v2" ON patients FOR SELECT
TO authenticated
USING (
    clinic_id IN (SELECT user_clinic_ids()) OR is_admin()
);

CREATE POLICY "patients_insert_v2" ON patients FOR INSERT
TO authenticated
WITH CHECK (
    clinic_id IN (SELECT user_clinic_ids()) OR is_admin()
);

CREATE POLICY "patients_update_v2" ON patients FOR UPDATE
TO authenticated
USING (
    clinic_id IN (SELECT user_clinic_ids()) OR is_admin()
);

CREATE POLICY "patients_delete_v2" ON patients FOR DELETE
TO authenticated
USING (
    clinic_id IN (SELECT user_clinic_ids()) OR is_admin()
);

-- ==============================================================================
-- 5. FIX STAFF TABLE POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Staff viewable by clinic owners" ON staff;
DROP POLICY IF EXISTS "Staff insertable by clinic owners" ON staff;
DROP POLICY IF EXISTS "Staff updatable by clinic owners" ON staff;
DROP POLICY IF EXISTS "Staff deletable by clinic owners" ON staff;

CREATE POLICY "staff_select_v2" ON staff FOR SELECT
TO authenticated
USING (
    clinic_id IN (SELECT user_clinic_ids()) OR is_admin()
);

CREATE POLICY "staff_insert_v2" ON staff FOR INSERT
TO authenticated
WITH CHECK (
    clinic_id IN (SELECT user_clinic_ids()) OR is_admin()
);

CREATE POLICY "staff_update_v2" ON staff FOR UPDATE
TO authenticated
USING (
    clinic_id IN (SELECT user_clinic_ids()) OR is_admin()
);

CREATE POLICY "staff_delete_v2" ON staff FOR DELETE
TO authenticated
USING (
    clinic_id IN (SELECT user_clinic_ids()) OR is_admin()
);

-- ==============================================================================
-- 6. FIX APPOINTMENTS TABLE POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Clinic owners can view appointments" ON appointments;
DROP POLICY IF EXISTS "Clinic owners can create appointments" ON appointments;
DROP POLICY IF EXISTS "Clinic owners can update appointments" ON appointments;
DROP POLICY IF EXISTS "Clinic owners can delete appointments" ON appointments;

CREATE POLICY "appointments_select_v2" ON appointments FOR SELECT
TO authenticated
USING (
    clinic_id IN (SELECT user_clinic_ids()) OR is_admin()
);

CREATE POLICY "appointments_insert_v2" ON appointments FOR INSERT
TO authenticated
WITH CHECK (
    clinic_id IN (SELECT user_clinic_ids()) OR is_admin()
);

CREATE POLICY "appointments_update_v2" ON appointments FOR UPDATE
TO authenticated
USING (
    clinic_id IN (SELECT user_clinic_ids()) OR is_admin()
);

CREATE POLICY "appointments_delete_v2" ON appointments FOR DELETE
TO authenticated
USING (
    clinic_id IN (SELECT user_clinic_ids()) OR is_admin()
);

-- ==============================================================================
-- 7. FIX FINANCIAL TRANSACTIONS TABLE POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Transactions are viewable by clinic owners" ON financial_transactions;
DROP POLICY IF EXISTS "Transactions are insertable by clinic owners" ON financial_transactions;
DROP POLICY IF EXISTS "Transactions are updatable by clinic owners" ON financial_transactions;
DROP POLICY IF EXISTS "Transactions are deletable by clinic owners" ON financial_transactions;

CREATE POLICY "transactions_select_v2" ON financial_transactions FOR SELECT
TO authenticated
USING (
    clinic_id IN (SELECT user_clinic_ids()) OR is_admin()
);

CREATE POLICY "transactions_insert_v2" ON financial_transactions FOR INSERT
TO authenticated
WITH CHECK (
    clinic_id IN (SELECT user_clinic_ids()) OR is_admin()
);

CREATE POLICY "transactions_update_v2" ON financial_transactions FOR UPDATE
TO authenticated
USING (
    clinic_id IN (SELECT user_clinic_ids()) OR is_admin()
);

CREATE POLICY "transactions_delete_v2" ON financial_transactions FOR DELETE
TO authenticated
USING (
    clinic_id IN (SELECT user_clinic_ids()) OR is_admin()
);

-- ==============================================================================
-- 8. FIX INVENTORY TABLE POLICIES
-- ==============================================================================
DROP POLICY IF EXISTS "Inventory viewable by clinic owners" ON inventory;
DROP POLICY IF EXISTS "Inventory insertable by clinic owners" ON inventory;
DROP POLICY IF EXISTS "Inventory updatable by clinic owners" ON inventory;
DROP POLICY IF EXISTS "Inventory deletable by clinic owners" ON inventory;

CREATE POLICY "inventory_select_v2" ON inventory FOR SELECT
TO authenticated
USING (
    clinic_id IN (SELECT user_clinic_ids()) OR is_admin()
);

CREATE POLICY "inventory_insert_v2" ON inventory FOR INSERT
TO authenticated
WITH CHECK (
    clinic_id IN (SELECT user_clinic_ids()) OR is_admin()
);

CREATE POLICY "inventory_update_v2" ON inventory FOR UPDATE
TO authenticated
USING (
    clinic_id IN (SELECT user_clinic_ids()) OR is_admin()
);

CREATE POLICY "inventory_delete_v2" ON inventory FOR DELETE
TO authenticated
USING (
    clinic_id IN (SELECT user_clinic_ids()) OR is_admin()
);

-- ==============================================================================
-- DONE
-- ==============================================================================
DO $$ BEGIN RAISE NOTICE 'RLS infinite recursion fix applied successfully.'; END $$;
