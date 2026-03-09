-- Add rating and finance columns to dental_lab_orders
ALTER TABLE dental_lab_orders 
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS review_note TEXT,
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS expected_delivery_date DATE,
ADD COLUMN IF NOT EXISTS modification_note TEXT;

-- Comment on columns
COMMENT ON COLUMN dental_lab_orders.rating IS 'Doctor rating for the lab service (1-5 stars)';
COMMENT ON COLUMN dental_lab_orders.review_note IS 'Optional text review from the doctor';
COMMENT ON COLUMN dental_lab_orders.paid_amount IS 'Amount paid by the clinic towards this order';
COMMENT ON COLUMN dental_lab_orders.expected_delivery_date IS 'Expected date for the lab to deliver the work';
