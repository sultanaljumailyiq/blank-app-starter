-- Add dual-delegate columns to dental_lab_orders table
ALTER TABLE dental_lab_orders
  ADD COLUMN IF NOT EXISTS pickup_delegate_id uuid,
  ADD COLUMN IF NOT EXISTS pickup_delegate_name text,
  ADD COLUMN IF NOT EXISTS delivery_delegate_id uuid,
  ADD COLUMN IF NOT EXISTS delivery_delegate_name text;

-- (Optional) If we want to drop the old columns we could, but let's keep them for fallback or remove them if clean
-- For now, let's keep delegate_id and delegate_name as they are, but migrate towards pickup/delivery
