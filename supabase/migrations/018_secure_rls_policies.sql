-- Secure RLS Policies for Multi-Clinic Isolation
-- This migration updates RLS policies to ensure strict data isolation.
-- Currently focuses on Clinic Owner access. Future updates will be needed for proper Staff access.

-- ==============================================================================
-- 1. CLINICS TABLE
-- ==============================================================================
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own clinics" ON clinics;
DROP POLICY IF EXISTS "Users can create their own clinics" ON clinics;
DROP POLICY IF EXISTS "Users can update their own clinics" ON clinics;
DROP POLICY IF EXISTS "Users can delete their own clinics" ON clinics;

CREATE POLICY "Users can view their own clinics"
ON clinics FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own clinics"
ON clinics FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own clinics"
ON clinics FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own clinics"
ON clinics FOR DELETE
USING (user_id = auth.uid());


-- ==============================================================================
-- 2. PATIENTS TABLE
-- ==============================================================================
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinic owners can view their patients" ON patients;
DROP POLICY IF EXISTS "Clinic owners can create patients" ON patients;
DROP POLICY IF EXISTS "Clinic owners can update patients" ON patients;
DROP POLICY IF EXISTS "Clinic owners can delete patients" ON patients;

-- Drop old broad policies if any (by name or trying to match generic ones)
DROP POLICY IF EXISTS "Allow patients to read own profile" ON patients;
DROP POLICY IF EXISTS "Allow admins and doctors to read patients" ON patients;
DROP POLICY IF EXISTS "Allow admins and doctors to create patients" ON patients;
DROP POLICY IF EXISTS "Allow admins and doctors to update patients" ON patients;
DROP POLICY IF EXISTS "Allow admins to delete patients" ON patients;

-- New Policies
CREATE POLICY "Clinic owners can view their patients"
ON patients FOR SELECT
USING (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);

CREATE POLICY "Clinic owners can create patients"
ON patients FOR INSERT
WITH CHECK (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);

CREATE POLICY "Clinic owners can update patients"
ON patients FOR UPDATE
USING (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);

CREATE POLICY "Clinic owners can delete patients"
ON patients FOR DELETE
USING (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);


-- ==============================================================================
-- 3. APPOINTMENTS TABLE
-- ==============================================================================
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow patients to read own appointments" ON appointments;
DROP POLICY IF EXISTS "Allow admins and doctors to read appointments" ON appointments;
DROP POLICY IF EXISTS "Allow admins and doctors to create appointments" ON appointments;
DROP POLICY IF EXISTS "Allow admins and doctors to update appointments" ON appointments;
DROP POLICY IF EXISTS "Allow admins to delete appointments" ON appointments;

CREATE POLICY "Clinic owners can view appointments"
ON appointments FOR SELECT
USING (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);

CREATE POLICY "Clinic owners can create appointments"
ON appointments FOR INSERT
WITH CHECK (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);

CREATE POLICY "Clinic owners can update appointments"
ON appointments FOR UPDATE
USING (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);

CREATE POLICY "Clinic owners can delete appointments"
ON appointments FOR DELETE
USING (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);


-- ==============================================================================
-- 4. FINANCIAL TRANSACTIONS TABLE
-- ==============================================================================
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Transactions are viewable by clinic owners" ON financial_transactions;
DROP POLICY IF EXISTS "Transactions are insertable by clinic owners" ON financial_transactions;
DROP POLICY IF EXISTS "Transactions are updatable by clinic owners" ON financial_transactions;
DROP POLICY IF EXISTS "Transactions are deletable by clinic owners" ON financial_transactions;

CREATE POLICY "Transactions are viewable by clinic owners"
ON financial_transactions FOR SELECT
USING (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);

CREATE POLICY "Transactions are insertable by clinic owners"
ON financial_transactions FOR INSERT
WITH CHECK (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);

CREATE POLICY "Transactions are updatable by clinic owners"
ON financial_transactions FOR UPDATE
USING (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);

CREATE POLICY "Transactions are deletable by clinic owners"
ON financial_transactions FOR DELETE
USING (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);


-- ==============================================================================
-- 5. INVENTORY TABLE
-- ==============================================================================
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Assuming inventory table has clinic_id (added in previous migration or 015)
-- We need to check if policies exist. Dropping common names or just adding new ones.
-- Best practice: Drop if exists to avoid conflicts.

DROP POLICY IF EXISTS "Inventory viewable by clinic owners" ON inventory;
DROP POLICY IF EXISTS "Inventory manageable by clinic owners" ON inventory;

CREATE POLICY "Inventory viewable by clinic owners"
ON inventory FOR SELECT
USING (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);

CREATE POLICY "Inventory insertable by clinic owners"
ON inventory FOR INSERT
WITH CHECK (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);

CREATE POLICY "Inventory updatable by clinic owners"
ON inventory FOR UPDATE
USING (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);

CREATE POLICY "Inventory deletable by clinic owners"
ON inventory FOR DELETE
USING (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);


-- ==============================================================================
-- 6. STAFF TABLE
-- ==============================================================================
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff viewable by clinic owners" ON staff;
DROP POLICY IF EXISTS "Staff manageable by clinic owners" ON staff;

CREATE POLICY "Staff viewable by clinic owners"
ON staff FOR SELECT
USING (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);

CREATE POLICY "Staff insertable by clinic owners"
ON staff FOR INSERT
WITH CHECK (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);

CREATE POLICY "Staff updatable by clinic owners"
ON staff FOR UPDATE
USING (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);

CREATE POLICY "Staff deletable by clinic owners"
ON staff FOR DELETE
USING (
  clinic_id IN (SELECT id FROM clinics WHERE user_id = auth.uid())
);
