-- تعديل جدول المخزون لإضافة معرف العيادة والأعمدة المفقودة
ALTER TABLE inventory 
ADD COLUMN IF NOT EXISTS clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'pcs',
ADD COLUMN IF NOT EXISTS status TEXT GENERATED ALWAYS AS (
  CASE 
    WHEN quantity <= 0 THEN 'out_of_stock'
    WHEN quantity <= min_stock THEN 'low_stock'
    WHEN expiry_date <= CURRENT_DATE THEN 'expired'
    ELSE 'available'
  END
) STORED;

CREATE INDEX IF NOT EXISTS idx_inventory_clinic_id ON inventory(clinic_id);
