-- 1. COMMISSIONS & FINANCE
CREATE TABLE IF NOT EXISTS financial_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT CHECK (type IN ('income', 'expense')),
    amount DECIMAL(12,2) NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    source_type TEXT, -- 'order_commission', 'subscription', 'withdrawal'
    source_id UUID,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COUPONS
CREATE TABLE IF NOT EXISTS coupons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    supplier_id UUID, -- NULL for platform-wide
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROMOTIONS / DEALS
CREATE TABLE IF NOT EXISTS promotions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    discount_percentage INTEGER,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROMOTIONAL CARDS (Banners)
CREATE TABLE IF NOT EXISTS promotional_cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    link_url TEXT,
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. OFFER REQUESTS (Suppliers requesting to be in offers)
CREATE TABLE IF NOT EXISTS offer_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    supplier_id UUID NOT NULL, -- REFERENCES suppliers(id)
    product_id UUID NOT NULL, -- REFERENCES products(id)
    initial_price DECIMAL(10,2),
    discounted_price DECIMAL(10,2),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policies
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotional_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Financials" ON financial_records; 
CREATE POLICY "Public Read Financials" ON financial_records FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin Manage Financials" ON financial_records;
CREATE POLICY "Admin Manage Financials" ON financial_records FOR ALL USING (true);

DROP POLICY IF EXISTS "Public Read All" ON coupons;
CREATE POLICY "Public Read All" ON coupons FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Read All 2" ON promotions;
CREATE POLICY "Public Read All 2" ON promotions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Read All 3" ON promotional_cards;
CREATE POLICY "Public Read All 3" ON promotional_cards FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public Read All 4" ON offer_requests;
CREATE POLICY "Public Read All 4" ON offer_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Insert All" ON coupons;
CREATE POLICY "Allow Insert All" ON coupons FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow Insert All 2" ON promotions;
CREATE POLICY "Allow Insert All 2" ON promotions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow Insert All 3" ON promotional_cards;
CREATE POLICY "Allow Insert All 3" ON promotional_cards FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow Insert All 4" ON offer_requests;
CREATE POLICY "Allow Insert All 4" ON offer_requests FOR INSERT WITH CHECK (true);
