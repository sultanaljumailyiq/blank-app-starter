-- جدول العلاجات والخدمات
CREATE TABLE IF NOT EXISTS treatments (
  id SERIAL PRIMARY KEY,
  treatment_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('prevention', 'treatment', 'surgery', 'cosmetic', 'emergency')),
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER,
  requires_anesthesia BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  popularity_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهارس
CREATE INDEX idx_treatments_category ON treatments(category);
CREATE INDEX idx_treatments_available ON treatments(is_available);

-- RLS Policies
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;

-- الجميع يمكنهم قراءة العلاجات المتاحة
CREATE POLICY "Allow public read access to available treatments"
  ON treatments FOR SELECT
  TO public
  USING (is_available = true);

-- المشرفون والأطباء يمكنهم إدارة العلاجات
CREATE POLICY "Allow admins and doctors to manage treatments"
  ON treatments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'doctor')
    )
  );
