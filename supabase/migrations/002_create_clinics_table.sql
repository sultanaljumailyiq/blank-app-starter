-- جدول العيادات
CREATE TABLE IF NOT EXISTS clinics (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(2, 1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  image_url TEXT,
  description TEXT,
  services JSONB DEFAULT '[]',
  working_hours JSONB DEFAULT '{}',
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهارس للبحث
CREATE INDEX idx_clinics_city ON clinics(city);
CREATE INDEX idx_clinics_owner ON clinics(owner_id);
CREATE INDEX idx_clinics_active ON clinics(is_active);

-- RLS Policies
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

-- الجميع يمكنهم قراءة العيادات النشطة
CREATE POLICY "Allow public read access to active clinics"
  ON clinics FOR SELECT
  TO public
  USING (is_active = true);

-- المشرفون وأصحاب العيادات يمكنهم التحديث
CREATE POLICY "Allow owners and admins to update clinics"
  ON clinics FOR UPDATE
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- المشرفون يمكنهم الإضافة والحذف
CREATE POLICY "Allow admins to insert clinics"
  ON clinics FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'doctor')
    )
  );

CREATE POLICY "Allow admins to delete clinics"
  ON clinics FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
