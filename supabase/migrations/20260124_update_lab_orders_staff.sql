-- Add staff_record_id to dental_lab_orders
ALTER TABLE dental_lab_orders
ADD COLUMN IF NOT EXISTS staff_record_id INTEGER REFERENCES staff(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_lab_orders_staff_record ON dental_lab_orders(staff_record_id);
