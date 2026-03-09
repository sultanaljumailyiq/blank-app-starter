-- Create deal_requests table for supplier promotion requests
-- Migration: 20260209_create_deal_requests.sql

-- ========================================
-- DEAL REQUESTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS deal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    discount_percentage INTEGER NOT NULL DEFAULT 10,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_deal_requests_supplier_id ON deal_requests(supplier_id);
CREATE INDEX IF NOT EXISTS idx_deal_requests_status ON deal_requests(status);
CREATE INDEX IF NOT EXISTS idx_deal_requests_product_id ON deal_requests(product_id);

-- Enable RLS
ALTER TABLE deal_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Allow read deal_requests" ON deal_requests;
DROP POLICY IF EXISTS "Allow insert deal_requests" ON deal_requests;
DROP POLICY IF EXISTS "Allow update deal_requests" ON deal_requests;

CREATE POLICY "Allow read deal_requests" ON deal_requests
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insert deal_requests" ON deal_requests
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow update deal_requests" ON deal_requests
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON deal_requests TO authenticated;

-- ========================================
-- ALSO CREATE PROMOTION REQUESTS TABLE (for badges, featured, etc)
-- ========================================
CREATE TABLE IF NOT EXISTS promotion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    request_type VARCHAR(30) NOT NULL CHECK (request_type IN ('new_badge', 'featured', 'exclusive', 'discount')),
    details JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_promotion_requests_supplier_id ON promotion_requests(supplier_id);
CREATE INDEX IF NOT EXISTS idx_promotion_requests_status ON promotion_requests(status);

-- Enable RLS
ALTER TABLE promotion_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Allow all promotion_requests" ON promotion_requests;
CREATE POLICY "Allow all promotion_requests" ON promotion_requests
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON promotion_requests TO authenticated;
