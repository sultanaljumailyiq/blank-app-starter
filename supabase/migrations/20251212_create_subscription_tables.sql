-- Create Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    price JSONB NOT NULL, -- { "monthly": 25000, "yearly": 250000, "currency": "د.ع" }
    features TEXT[] DEFAULT '{}',
    is_popular BOOLEAN DEFAULT false,
    duration TEXT DEFAULT 'monthly', -- 'monthly' or 'yearly'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Subscription Requests Table
CREATE TABLE IF NOT EXISTS subscription_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES profiles(id),
    plan_id UUID REFERENCES subscription_plans(id),
    doctor_name TEXT, -- Snapshot or fallback
    clinic_name TEXT,
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    payment_method TEXT, -- 'zain', 'rafidain', 'agent'
    receipt_image_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT DEFAULT 'fixed' CHECK (discount_type IN ('fixed', 'percentage')),
    value NUMERIC NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read plans" ON subscription_plans FOR SELECT USING (true);
CREATE POLICY "Admin all plans" ON subscription_plans FOR ALL USING (auth.role() = 'authenticated'); -- Simplified

CREATE POLICY "Doctors see own requests" ON subscription_requests FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors create requests" ON subscription_requests FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "Admin all requests" ON subscription_requests FOR ALL USING (auth.role() = 'authenticated'); -- Simplified

CREATE POLICY "Public read coupons" ON coupons FOR SELECT USING (true); -- Or maybe authenticated only? Public for now to allow lookup
CREATE POLICY "Admin all coupons" ON coupons FOR ALL USING (auth.role() = 'authenticated');

-- Seed Data (Matching Frontend Mocks)
INSERT INTO subscription_plans (name, name_en, price, features, is_popular, duration) VALUES
(
    'الباقة الأساسية',
    'Basic Plan',
    '{"monthly": 25000, "currency": "د.ع"}',
    ARRAY['إدارة عيادة واحدة', '500 ملف مريض', 'تذكيرات واتساب (محدود)', 'تقارير مالية أساسية'],
    false,
    'monthly'
),
(
    'الباقة المميزة',
    'Premium Plan',
    '{"monthly": 50000, "currency": "د.ع"}',
    ARRAY['عيادات غير محدودة', 'ملفات مرضى بلا حدود', 'تذكيرات واتساب آلي', 'تحليل ذكي للإيرادات', 'دعم فني 24/7'],
    true,
    'monthly'
);

INSERT INTO coupons (code, discount_type, value) VALUES
('WELCOME2025', 'percentage', 20),
('SMART10', 'fixed', 5000);
