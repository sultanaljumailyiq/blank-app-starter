-- جدول المخزون
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price DECIMAL(10, 2) NOT NULL,
  min_stock INTEGER DEFAULT 10,
  supplier_name TEXT,
  supplier_phone TEXT,
  last_restock_date DATE,
  expiry_date DATE,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهارس
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_low_stock ON inventory(quantity) WHERE quantity <= min_stock;

-- RLS Policies
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- الأطباء والمشرفون يمكنهم القراءة
CREATE POLICY "Allow doctors and admins to read inventory"
  ON inventory FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'doctor')
    )
  );

-- المشرفون فقط يمكنهم الإدارة الكاملة
CREATE POLICY "Allow admins to manage inventory"
  ON inventory FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
