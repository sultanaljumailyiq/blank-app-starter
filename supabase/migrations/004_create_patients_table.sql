-- جدول المرضى
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age INTEGER,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  city TEXT,
  emergency_contact TEXT,
  blood_type TEXT,
  allergies TEXT[] DEFAULT '{}',
  medical_history TEXT,
  last_visit_date DATE,
  total_visits INTEGER DEFAULT 0,
  assigned_doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_doctor_name TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهارس
CREATE INDEX idx_patients_user ON patients(user_id);
CREATE INDEX idx_patients_doctor ON patients(assigned_doctor_id);
CREATE INDEX idx_patients_phone ON patients(phone);

-- RLS Policies
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- المريض يمكنه رؤية بياناته فقط
CREATE POLICY "Allow users to read own patient data"
  ON patients FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- المشرفون والأطباء المعينون يمكنهم رؤية بيانات المرضى
CREATE POLICY "Allow admins and assigned doctors to read patients"
  ON patients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'doctor')
    )
  );

-- المشرفون والأطباء يمكنهم إضافة مرضى
CREATE POLICY "Allow admins and doctors to create patients"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'doctor')
    )
  );

-- المشرفون والأطباء المعينون يمكنهم التحديث
CREATE POLICY "Allow admins and doctors to update patients"
  ON patients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'doctor')
    )
  );

-- المشرفون فقط يمكنهم الحذف
CREATE POLICY "Allow admins to delete patients"
  ON patients FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
