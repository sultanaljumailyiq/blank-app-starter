-- Comprehensive Lab Database Setup
-- Date: 2026-01-23

-- 1. Lab Disputes Table
CREATE TABLE IF NOT EXISTS lab_disputes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_id UUID REFERENCES dental_laboratories(id) ON DELETE CASCADE, -- Link to Lab Profile
  clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL, -- Link to Clinic
  order_id UUID REFERENCES dental_lab_orders(id) ON DELETE SET NULL, -- Optional Link to Order
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  resolution_notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient querying
CREATE INDEX IF NOT EXISTS idx_lab_disputes_lab ON lab_disputes(lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_disputes_clinic ON lab_disputes(clinic_id);
CREATE INDEX IF NOT EXISTS idx_lab_disputes_status ON lab_disputes(status);

-- RLS for Disputes
ALTER TABLE lab_disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Labs can view their own disputes" 
ON lab_disputes FOR SELECT 
USING (lab_id = auth.uid());

CREATE POLICY "Clinics can view their own disputes" 
ON lab_disputes FOR SELECT 
USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

CREATE POLICY "Clinics can create disputes" 
ON lab_disputes FOR INSERT 
WITH CHECK (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())); -- Basic check, can be refined

CREATE POLICY "Admins have full access to disputes" 
ON lab_disputes FOR ALL 
USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 2. Enhanced Lab Profile Columns
ALTER TABLE dental_laboratories
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS bank_information JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS notifications_settings JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb;

-- 3. Admin Reports View
-- Summarizes financial performance and status for the Admin Dashboard
CREATE OR REPLACE VIEW admin_lab_performance_view AS
SELECT 
    l.id AS lab_id,
    l.lab_name,
    l.owner_id,
    l.is_verified,
    l.commission_percentage,
    -- Financials (Calculated from completed orders)
    COALESCE(SUM(o.final_amount) FILTER (WHERE o.status = 'completed' OR o.status = 'delivered'), 0) AS total_revenue,
    COALESCE(SUM(o.paid_amount) FILTER (WHERE o.status = 'completed' OR o.status = 'delivered'), 0) AS collected_revenue,
    l.pending_commission AS pending_platform_fees,
    -- Orders Stats
    COUNT(o.id) AS total_orders,
    COUNT(o.id) FILTER (WHERE o.status = 'completed' OR o.status = 'delivered') AS completed_orders,
    COUNT(o.id) FILTER (WHERE o.status = 'cancelled' OR o.status = 'rejected') AS cancelled_orders,
    -- Disputes
    (SELECT COUNT(*) FROM lab_disputes d WHERE d.lab_id = l.id AND d.status IN ('open', 'under_review')) AS active_disputes
FROM 
    dental_laboratories l
LEFT JOIN 
    dental_lab_orders o ON l.id = o.laboratory_id
GROUP BY 
    l.id, l.lab_name, l.owner_id, l.is_verified, l.commission_percentage, l.pending_commission;

-- 4. Grant Access to Reports View
GRANT SELECT ON admin_lab_performance_view TO authenticated;
-- Note: Logic in application (RLS or API) should restrict this to Admins only, 
-- or we can wrap it in a function with security definer if strict DB-level access is needed.
