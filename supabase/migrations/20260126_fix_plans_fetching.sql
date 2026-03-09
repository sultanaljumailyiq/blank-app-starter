-- FIX: Complete Reset of RLS and Seed for Subscription Plans
-- This script ensures plans are readable by everyone and seed data exists.

-- ==============================================================================
-- 1. SUBSCRIPTION PLANS
-- ==============================================================================

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- Drop all known policy variations
    DROP POLICY IF EXISTS "Public read plans" ON subscription_plans;
    DROP POLICY IF EXISTS "Public Read Plans" ON subscription_plans;
    DROP POLICY IF EXISTS "Anyone can read plans" ON subscription_plans;
    DROP POLICY IF EXISTS "Admin all plans" ON subscription_plans;
    DROP POLICY IF EXISTS "Admin Manage Plans" ON subscription_plans;
    DROP POLICY IF EXISTS "Admins manage plans" ON subscription_plans;
    DROP POLICY IF EXISTS "Admins can manage plans" ON subscription_plans;
END $$;

-- Create Clean Policies
CREATE POLICY "v2_anyone_read_plans" 
ON subscription_plans FOR SELECT 
USING (true);

CREATE POLICY "v2_admins_manage_plans" 
ON subscription_plans FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- ==============================================================================
-- 2. COUPONS
-- ==============================================================================

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Read coupons" ON coupons;
    DROP POLICY IF EXISTS "Authenticated read coupons" ON coupons;
    DROP POLICY IF EXISTS "Manage coupons" ON coupons;
    DROP POLICY IF EXISTS "Admins manage coupons" ON coupons;
END $$;

CREATE POLICY "v2_auth_read_coupons" 
ON coupons FOR SELECT 
TO authenticated 
USING (is_active = true);

CREATE POLICY "v2_admins_manage_coupons" 
ON coupons FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- ==============================================================================
-- 3. SEED DUMMY PLANS (If Empty)
-- ==============================================================================

INSERT INTO subscription_plans (name, name_en, price, features, is_popular, duration)
SELECT 'الباقة الأساسية', 'Basic Plan', '{"monthly": 25000, "currency": "IQD", "settings": {"maxClinics": 1, "maxPatients": 500, "aiRequestLimit": 0}}', 
'["إدارة عيادة واحدة", "إدارة حتى 500 مريض", "دعم فني عبر البريد"]', false, 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans);

INSERT INTO subscription_plans (name, name_en, price, features, is_popular, duration)
SELECT 'الباقة المتقدمة', 'Premium Plan', '{"monthly": 50000, "currency": "IQD", "settings": {"maxClinics": 2, "maxPatients": 2000, "aiRequestLimit": 50}}', 
'["إدارة عيادتين", "إدارة حتى 2000 مريض", "استخدام الذكاء الاصطناعي (محدود)", "أولوية في الدعم"]', true, 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name_en = 'Premium Plan');

INSERT INTO subscription_plans (name, name_en, price, features, is_popular, duration)
SELECT 'الباقة الشاملة', 'Enterprise Plan', '{"monthly": 100000, "currency": "IQD", "settings": {"maxClinics": 10, "maxPatients": 999999, "aiRequestLimit": -1}}', 
'["عدد عيادات غير محدود", "ملفات مرضى غير محدودة", "ذكاء اصطناعي غير محدود", "مدير حساب خاص", "الظهور في الخريطة"]', false, 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name_en = 'Enterprise Plan');
