-- Add doctor_name to dental_lab_orders
ALTER TABLE dental_lab_orders ADD COLUMN IF NOT EXISTS doctor_name TEXT;
