-- Fix Financial Transactions Schema and Permissions
-- Run this in your Supabase SQL Editor

-- 1. Add missing Foreign Key columns if they don't exist
ALTER TABLE financial_transactions 
ADD COLUMN IF NOT EXISTS patient_id INTEGER REFERENCES patients(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS doctor_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS assistant_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS recorded_by INTEGER REFERENCES staff(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS treatment_id TEXT, -- Or REFERENCES treatments(id) if table exists
ADD COLUMN IF NOT EXISTS inventory_item_id INTEGER REFERENCES inventory(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS lab_request_id TEXT,
ADD COLUMN IF NOT EXISTS extra_cost DECIMAL(10, 2) DEFAULT 0;

-- 2. Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_finance_patient ON financial_transactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_finance_doctor ON financial_transactions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_finance_clinic ON financial_transactions(clinic_id);

-- 3. Fix RLS Policies (Allow CRUD for authenticated users)
-- Enable RLS
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow public read for demo transactions" ON financial_transactions;
DROP POLICY IF EXISTS "Enable read access for all users" ON financial_transactions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON financial_transactions;

-- Create comprehensive policies
CREATE POLICY "Enable all access for authenticated users"
ON financial_transactions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Verify Relations (Soft check)
-- Ensure 'patients' and 'staff' tables allow read access so the Join queries work
CREATE POLICY "Allow read access for authenticated users" ON patients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON staff FOR SELECT TO authenticated USING (true);
