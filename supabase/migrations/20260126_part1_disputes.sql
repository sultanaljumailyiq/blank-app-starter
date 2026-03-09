-- Part 1: Lab Disputes Table Only
CREATE TABLE IF NOT EXISTS lab_disputes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_id UUID REFERENCES dental_laboratories(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL,
  order_id UUID REFERENCES dental_lab_orders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  resolution_notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE lab_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Labs can view their own disputes" 
ON lab_disputes FOR SELECT 
USING (lab_id = auth.uid());
