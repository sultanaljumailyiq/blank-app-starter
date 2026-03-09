-- Add missing columns to financial_transactions table to support detailed finance tracking

ALTER TABLE financial_transactions 
ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES staff(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS treatment_id UUID REFERENCES treatments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES inventory(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS lab_request_id UUID REFERENCES dental_lab_orders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES staff(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS extra_cost DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS assistant_id UUID REFERENCES staff(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_finance_doctor ON financial_transactions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_finance_recorded_by ON financial_transactions(recorded_by);
