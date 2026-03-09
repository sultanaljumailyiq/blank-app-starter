
-- 1. Promotions / Offers Table (General Site Offers)
CREATE TABLE IF NOT EXISTS promotions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    banner_url TEXT,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2),
    start_date TIMESTAMPTZ,
    expiry_date TIMESTAMPTZ,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Featured Products / Supplier Offers (Paid Placement)
CREATE TABLE IF NOT EXISTS featured_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ DEFAULT now(),
    end_date TIMESTAMPTZ,
    status TEXT DEFAULT 'active', -- active, expired
    placement_type TEXT DEFAULT 'home_slider', -- home_slider, featured_list, etc.
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_products ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public can view active promotions" ON promotions FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active coupons" ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view featured products" ON featured_products FOR SELECT USING (status = 'active');

-- Admin Full Access (Simplified: allow all for demo logic or restricted if we had admin role check)
-- For now, we assume RLS is open or handled by service_role for admin actions, 
-- but let's allow authenticated users to view for now to avoid complexity in demo.
CREATE POLICY "Auth users can view all" ON promotions FOR SELECT TO authenticated USING (true);
