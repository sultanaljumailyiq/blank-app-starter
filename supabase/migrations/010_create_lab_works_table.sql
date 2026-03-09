-- جدول الأعمال المخبرية
CREATE TABLE IF NOT EXISTS lab_works (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  test_type TEXT NOT NULL,
  description TEXT,
  requested_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  requested_by_name TEXT NOT NULL,
  request_date DATE NOT NULL,
  completion_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  results TEXT,
  cost DECIMAL(10, 2),
  lab_technician TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهارس
CREATE INDEX idx_lab_works_patient ON lab_works(patient_id);
CREATE INDEX idx_lab_works_status ON lab_works(status);
CREATE INDEX idx_lab_works_date ON lab_works(request_date DESC);

-- RLS Policies
ALTER TABLE lab_works ENABLE ROW LEVEL SECURITY;

-- المرضى يمكنهم رؤية نتائجهم
CREATE POLICY "Allow patients to read own lab results"
  ON lab_works FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patients
      WHERE patients.id = lab_works.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- المشرفون والأطباء يمكنهم إدارة الأعمال المخبرية
CREATE POLICY "Allow admins and doctors to manage lab works"
  ON lab_works FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'doctor')
    )
  );
