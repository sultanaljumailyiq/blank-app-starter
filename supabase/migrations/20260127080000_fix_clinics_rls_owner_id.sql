-- Fix RLS Policy for clinics table
-- The clinics table uses owner_id, not user_id

-- Drop conflicting policies
DROP POLICY IF EXISTS "Users can view their own clinics" ON clinics;
DROP POLICY IF EXISTS "Users can create their own clinics" ON clinics;
DROP POLICY IF EXISTS "Users can update their own clinics" ON clinics;
DROP POLICY IF EXISTS "Users can delete their own clinics" ON clinics;
DROP POLICY IF EXISTS "Allow public read access to active clinics" ON clinics;
DROP POLICY IF EXISTS "Allow owners and admins to update clinics" ON clinics;
DROP POLICY IF EXISTS "Allow admins to insert clinics" ON clinics;
DROP POLICY IF EXISTS "Allow admins to delete clinics" ON clinics;

-- Create correct policies using owner_id
-- 1. SELECT: Owners can view their clinics, public can view active clinics
CREATE POLICY "Owners can view their clinics"
ON clinics FOR SELECT
USING (
  owner_id = auth.uid() OR 
  is_active = true
);

-- 2. INSERT: Doctors and admins can create clinics
CREATE POLICY "Doctors and admins can create clinics"
ON clinics FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'doctor')
  )
);

-- 3. UPDATE: Owners and admins can update clinics
CREATE POLICY "Owners and admins can update clinics"
ON clinics FOR UPDATE
USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 4. DELETE: Owners and admins can delete clinics
CREATE POLICY "Owners and admins can delete clinics"
ON clinics FOR DELETE
USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Also fix related tables that reference clinics.user_id (should be owner_id)
-- Update patients policy
DROP POLICY IF EXISTS "Clinic owners can view their patients" ON patients;
DROP POLICY IF EXISTS "Clinic owners can create patients" ON patients;
DROP POLICY IF EXISTS "Clinic owners can update patients" ON patients;
DROP POLICY IF EXISTS "Clinic owners can delete patients" ON patients;

CREATE POLICY "Clinic owners can view their patients"
ON patients FOR SELECT
USING (
  clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
);

CREATE POLICY "Clinic owners can create patients"
ON patients FOR INSERT
WITH CHECK (
  clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
);

CREATE POLICY "Clinic owners can update patients"
ON patients FOR UPDATE
USING (
  clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
);

CREATE POLICY "Clinic owners can delete patients"
ON patients FOR DELETE
USING (
  clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
);

-- Update appointments policy
DROP POLICY IF EXISTS "Clinic owners can view appointments" ON appointments;
DROP POLICY IF EXISTS "Clinic owners can create appointments" ON appointments;
DROP POLICY IF EXISTS "Clinic owners can update appointments" ON appointments;
DROP POLICY IF EXISTS "Clinic owners can delete appointments" ON appointments;

CREATE POLICY "Clinic owners can view appointments"
ON appointments FOR SELECT
USING (
  clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
);

CREATE POLICY "Clinic owners can create appointments"
ON appointments FOR INSERT
WITH CHECK (
  clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
);

CREATE POLICY "Clinic owners can update appointments"
ON appointments FOR UPDATE
USING (
  clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
);

CREATE POLICY "Clinic owners can delete appointments"
ON appointments FOR DELETE
USING (
  clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
);

-- Update financial_transactions policy
DROP POLICY IF EXISTS "Transactions are viewable by clinic owners" ON financial_transactions;
DROP POLICY IF EXISTS "Transactions are insertable by clinic owners" ON financial_transactions;
DROP POLICY IF EXISTS "Transactions are updatable by clinic owners" ON financial_transactions;
DROP POLICY IF EXISTS "Transactions are deletable by clinic owners" ON financial_transactions;

CREATE POLICY "Transactions are viewable by clinic owners"
ON financial_transactions FOR SELECT
USING (
  clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
);

CREATE POLICY "Transactions are insertable by clinic owners"
ON financial_transactions FOR INSERT
WITH CHECK (
  clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
);

CREATE POLICY "Transactions are updatable by clinic owners"
ON financial_transactions FOR UPDATE
USING (
  clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
);

CREATE POLICY "Transactions are deletable by clinic owners"
ON financial_transactions FOR DELETE
USING (
  clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
);

-- Update inventory policy
DROP POLICY IF EXISTS "Inventory viewable by clinic owners" ON inventory;
DROP POLICY IF EXISTS "Inventory insertable by clinic owners" ON inventory;
DROP POLICY IF EXISTS "Inventory updatable by clinic owners" ON inventory;
DROP POLICY IF EXISTS "Inventory deletable by clinic owners" ON inventory;

CREATE POLICY "Inventory viewable by clinic owners"
ON inventory FOR SELECT
USING (
  clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
);

CREATE POLICY "Inventory insertable by clinic owners"
ON inventory FOR INSERT
WITH CHECK (
  clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
);

CREATE POLICY "Inventory updatable by clinic owners"
ON inventory FOR UPDATE
USING (
  clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
);

CREATE POLICY "Inventory deletable by clinic owners"
ON inventory FOR DELETE
USING (
  clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
);

-- Update staff policy
DROP POLICY IF EXISTS "Staff viewable by clinic owners" ON staff;
DROP POLICY IF EXISTS "Staff insertable by clinic owners" ON staff;
DROP POLICY IF EXISTS "Staff updatable by clinic owners" ON staff;
DROP POLICY IF EXISTS "Staff deletable by clinic owners" ON staff;

CREATE POLICY "Staff viewable by clinic owners"
ON staff FOR SELECT
USING (
  clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
);

CREATE POLICY "Staff insertable by clinic owners"
ON staff FOR INSERT
WITH CHECK (
  clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
);

CREATE POLICY "Staff updatable by clinic owners"
ON staff FOR UPDATE
USING (
  clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
);

CREATE POLICY "Staff deletable by clinic owners"
ON staff FOR DELETE
USING (
  clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())
);
