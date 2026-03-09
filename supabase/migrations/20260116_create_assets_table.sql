-- Create Assets Table for Depreciating Fixed Assets
CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('equipment', 'furniture', 'electronics', 'software', 'building', 'other')),
  purchase_date DATE NOT NULL,
  purchase_cost DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'IQD',
  
  -- Depreciation details
  useful_life_years INTEGER NOT NULL DEFAULT 5, -- Expected years of use
  salvage_value DECIMAL(12, 2) DEFAULT 0, -- Value at the end of life
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'disposed', 'sold', 'written_off')),
  location TEXT,
  serial_number TEXT,
  supplier TEXT,
  warranty_expiry DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assets_clinic ON assets(clinic_id);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);

-- RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated to read assets"
  ON assets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated to insert assets"
  ON assets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated to update assets"
  ON assets FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated to delete assets"
  ON assets FOR DELETE
  TO authenticated
  USING (true);
