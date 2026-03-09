-- 20260126_fix_plans_schema_and_seed.sql

-- 1. Fix Subscription Plans Schema to match Frontend requirements
DO $$ 
BEGIN
    -- Fix 'price' column (Convert from Numeric to JSONB)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'price' AND data_type = 'numeric') THEN
        ALTER TABLE subscription_plans DROP COLUMN price;
        ALTER TABLE subscription_plans ADD COLUMN price JSONB DEFAULT '{"monthly": 0, "currency": "IQD"}';
    END IF;

    -- Ensure 'name_en' exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'name_en') THEN
        ALTER TABLE subscription_plans ADD COLUMN name_en TEXT;
    END IF;

    -- Ensure 'is_popular' exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'is_popular') THEN
        ALTER TABLE subscription_plans ADD COLUMN is_popular BOOLEAN DEFAULT false;
    END IF;

    -- Rename 'interval' to 'duration' if exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'interval') THEN
        ALTER TABLE subscription_plans RENAME COLUMN "interval" TO duration;
    END IF;
    
    -- Ensure 'duration' column exists (if rename didn't happen)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'duration') THEN
        ALTER TABLE subscription_plans ADD COLUMN duration TEXT DEFAULT 'monthly';
    END IF;
END $$;

-- 2. Fix RLS (Ensure Write Access)
DO $$ 
BEGIN
    -- Agents
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agents' AND policyname = 'Admins manage agents') THEN
        CREATE POLICY "Admins manage agents" ON agents FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    -- Payment Methods
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_methods' AND policyname = 'Admins manage payment_methods') THEN
        CREATE POLICY "Admins manage payment_methods" ON payment_methods FOR ALL USING (auth.role() = 'authenticated');
    END IF;
    -- Plans
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscription_plans' AND policyname = 'Admins manage plans') THEN
        CREATE POLICY "Admins manage plans" ON subscription_plans FOR ALL USING (auth.role() = 'authenticated');
    END IF;
     -- Coupons
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'Admins manage coupons') THEN
        CREATE POLICY "Admins manage coupons" ON coupons FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- 3. Seed Subscription Plans
-- Clear existing bad data
DELETE FROM subscription_plans WHERE name_en IN ('Basic Plan', 'Premium Plan', 'Enterprise Plan');

INSERT INTO subscription_plans (name, name_en, slug, price, features, is_popular, duration) VALUES
(
    'الباقة الأساسية', 
    'Basic Plan', 
    'basic-plan',
    '{"monthly": 25000, "currency": "د.ع", "settings": {"maxClinics": 1, "maxPatients": 500, "aiRequestLimit": 0}}'::jsonb, 
    '["إدارة عيادة واحدة", "500 ملف مريض", "تذكيرات واتساب (محدود)", "تقارير مالية أساسية"]'::jsonb, 
    false, 
    'monthly'
),
(
    'الباقة المميزة', 
    'Premium Plan', 
    'premium-plan',
    '{"monthly": 50000, "currency": "د.ع", "settings": {"maxClinics": 3, "maxPatients": 999999, "aiRequestLimit": 50, "isFeatured": true}}'::jsonb, 
    '["إدارة حتى 3 عيادات", "ملفات مرضى بلا حدود", "تذكيرات واتساب آلي", "تحليل ذكي للإيرادات", "دعم فني 24/7", "ذكاء اصطناعي (50 طلب يومياً)"]'::jsonb, 
    true, 
    'monthly'
),
(
    'الباقة المتكاملة', 
    'Enterprise Plan', 
    'enterprise-plan',
    '{"monthly": 100000, "currency": "د.ع", "settings": {"maxClinics": 999, "maxPatients": 999999, "aiRequestLimit": -1, "isFeatured": true, "digitalBooking": true}}'::jsonb, 
    '["عيادات غير محدودة", "كل المميزات السابقة", "ذكاء اصطناعي غير محدود", "نظام حجز رقمي متكامل", "تطبيق خاص للمرضى", "أولوية قصوى في الدعم"]'::jsonb, 
    false, 
    'monthly'
);

-- 4. Seed Payment Methods
INSERT INTO payment_methods (name, type, number, is_active, details)
SELECT 'ZainCash', 'manual', '07800000000', true, '{"instructions": "يرجى إرسال المبلغ مع ذكر الاسم ورقم الهاتف في الملاحظات"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE name = 'ZainCash');

INSERT INTO payment_methods (name, type, number, is_active, details)
SELECT 'QiCard (Rafidain)', 'manual', '1234-5678-9012-3456', true, '{"instructions": "التحويل عبر خدمات مصرف الرافدين"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE name LIKE 'QiCard%');
