-- Open Access for Demo Clinics (ID 1 & 2)
-- Purpose: Allow ANY authenticated user to see data for the demo clinics.
-- This ensures the demo experience works even if the user's role/profile isn't perfectly set up.

-- 1. Patients
CREATE POLICY "Allow public read for demo patients"
  ON patients FOR SELECT
  TO authenticated
  USING (clinic_id IN (1, 2));

-- 2. Inventory
CREATE POLICY "Allow public read for demo inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (clinic_id IN (1, 2));

-- 3. Appointments
CREATE POLICY "Allow public read for demo appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (clinic_id IN (1, 2));

-- 4. Staff
CREATE POLICY "Allow public read for demo staff"
  ON staff FOR SELECT
  TO authenticated
  USING (clinic_id IN (1, 2));

-- 5. Financial Transactions
CREATE POLICY "Allow public read for demo transactions"
  ON financial_transactions FOR SELECT
  TO authenticated
  USING (clinic_id IN (1, 2));

-- 6. Clinics (Just in case, though usually public)
-- (Already covered by existing policy, but ensuring update access for demo purposes if needed could be added here, 
--  but READ is the main issue. We'll stick to READ for now.)
