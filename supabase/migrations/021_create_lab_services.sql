-- Create Lab Services table
CREATE TABLE IF NOT EXISTS lab_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  estimated_time TEXT, -- e.g. "2-3 days" or "1 hour"
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_lab_services_lab ON lab_services(lab_id);

-- RLS
ALTER TABLE lab_services ENABLE ROW LEVEL SECURITY;

-- Labs can manage their own services
CREATE POLICY "Labs can manage their services"
ON lab_services FOR ALL
USING (lab_id = auth.uid());

-- Clinics (Authenticated) can view services (if we want them to pick from a list later)
CREATE POLICY "Authenticated users can view lab services"
ON lab_services FOR SELECT
TO authenticated
USING (true);
