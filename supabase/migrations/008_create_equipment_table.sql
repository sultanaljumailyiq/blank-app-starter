-- جدول الأجهزة والمعدات
CREATE TABLE IF NOT EXISTS equipment (
  id SERIAL PRIMARY KEY,
  equipment_name TEXT NOT NULL,
  category TEXT NOT NULL,
  purchase_price DECIMAL(10, 2) NOT NULL,
  purchase_date DATE NOT NULL,
  condition TEXT DEFAULT 'excellent' CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'needs_repair')),
  manufacturer TEXT,
  model_number TEXT,
  serial_number TEXT UNIQUE,
  warranty_expiry DATE,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  location TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهارس
CREATE INDEX idx_equipment_category ON equipment(category);
CREATE INDEX idx_equipment_condition ON equipment(condition);
CREATE INDEX idx_equipment_maintenance ON equipment(next_maintenance_date);

-- RLS Policies
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- الأطباء والمشرفون يمكنهم القراءة
CREATE POLICY "Allow doctors and admins to read equipment"
  ON equipment FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'doctor')
    )
  );

-- المشرفون فقط يمكنهم الإدارة الكاملة
CREATE POLICY "Allow admins to manage equipment"
  ON equipment FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
