-- جدول الموظفين
CREATE TABLE IF NOT EXISTS staff (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  role_title TEXT NOT NULL,
  department TEXT,
  salary DECIMAL(10, 2) NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  join_date DATE NOT NULL,
  contract_type TEXT DEFAULT 'full_time' CHECK (contract_type IN ('full_time', 'part_time', 'contract')),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهارس
CREATE INDEX idx_staff_user ON staff(user_id);
CREATE INDEX idx_staff_active ON staff(is_active);
CREATE INDEX idx_staff_department ON staff(department);

-- RLS Policies
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- الموظف يمكنه رؤية بياناته فقط
CREATE POLICY "Allow staff to read own data"
  ON staff FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- المشرفون يمكنهم رؤية جميع الموظفين
CREATE POLICY "Allow admins to read all staff"
  ON staff FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- المشرفون فقط يمكنهم إضافة/تحديث/حذف
CREATE POLICY "Allow admins to manage staff"
  ON staff FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
