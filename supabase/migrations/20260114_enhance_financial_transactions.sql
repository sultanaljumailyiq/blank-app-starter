-- Enhance financial_transactions table with detailed tracking fields

ALTER TABLE financial_transactions 
ADD COLUMN IF NOT EXISTS recorded_by INTEGER REFERENCES staff(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS doctor_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS assistant_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS treatment_id INTEGER REFERENCES treatments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS inventory_item_id INTEGER REFERENCES inventory(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS lab_request_id UUID REFERENCES dental_lab_orders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS extra_cost DECIMAL(10, 2) DEFAULT 0;

-- Indexes for easier filtering
CREATE INDEX IF NOT EXISTS idx_finance_doctor ON financial_transactions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_finance_treatment ON financial_transactions(treatment_id);
CREATE INDEX IF NOT EXISTS idx_finance_recorded_by ON financial_transactions(recorded_by);
