-- جدول السجلات المالية
CREATE TABLE IF NOT EXISTS financial_records (
  id SERIAL PRIMARY KEY,
  record_date DATE NOT NULL,
  record_month INTEGER NOT NULL CHECK (record_month >= 1 AND record_month <= 12),
  record_year INTEGER NOT NULL,
  revenue DECIMAL(12, 2) DEFAULT 0,
  expenses DECIMAL(12, 2) DEFAULT 0,
  net_profit DECIMAL(12, 2) GENERATED ALWAYS AS (revenue - expenses) STORED,
  revenue_sources JSONB DEFAULT '{}',
  expense_categories JSONB DEFAULT '{}',
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(record_month, record_year)
);

-- فهارس
CREATE INDEX idx_financial_date ON financial_records(record_year DESC, record_month DESC);

-- RLS Policies
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

-- المشرفون فقط يمكنهم رؤية وإدارة السجلات المالية
CREATE POLICY "Allow admins to manage financial records"
  ON financial_records FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
