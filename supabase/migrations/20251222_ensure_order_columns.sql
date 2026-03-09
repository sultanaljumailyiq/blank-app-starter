-- Ensure all required columns exist in dental_lab_orders
ALTER TABLE dental_lab_orders 
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS review_note TEXT,
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS expected_delivery_date DATE,
ADD COLUMN IF NOT EXISTS modification_note TEXT;

-- Update paid_amount to equal final_amount for existing 'paid' orders if it was 0 (Data cleanup)
UPDATE dental_lab_orders 
SET paid_amount = final_amount 
WHERE payment_status = 'paid' AND (paid_amount IS NULL OR paid_amount = 0);
