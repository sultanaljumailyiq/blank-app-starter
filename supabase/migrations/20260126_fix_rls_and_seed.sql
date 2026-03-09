-- 20260126_fix_rls_and_seed.sql

-- 1. Fix RLS Policies (Enable Write Access for Authenticated Users)

DO $$ 
BEGIN
    -- Agents Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agents' AND policyname = 'Admins manage agents') THEN
        CREATE POLICY "Admins manage agents" ON agents FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    -- Payment Methods Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_methods' AND policyname = 'Admins manage payment_methods') THEN
        CREATE POLICY "Admins manage payment_methods" ON payment_methods FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    -- Subscription Plans Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscription_plans' AND policyname = 'Admins manage plans') THEN
        CREATE POLICY "Admins manage plans" ON subscription_plans FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    -- Coupons Policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'Admins manage coupons') THEN
        CREATE POLICY "Admins manage coupons" ON coupons FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- 2. Seed Subscription Plans (Basic, Premium, Enterprise)
INSERT INTO subscription_plans (name, name_en, price, features, is_popular, duration)
SELECT 'الباقة الأساسية', 'Basic Plan', '{"monthly": 25000, "currency": "د.ع", "settings": {"maxClinics": 1, "maxPatients": 500, "aiRequestLimit": 0}}'::jsonb, 
ARRAY['إدارة عيادة واحدة', '500 ملف مريض', 'تذكيرات واتساب (محدود)', 'تقارير مالية أساسية'], false, 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name_en = 'Basic Plan');

INSERT INTO subscription_plans (name, name_en, price, features, is_popular, duration)
SELECT 'الباقة المميزة', 'Premium Plan', '{"monthly": 50000, "currency": "د.ع", "settings": {"maxClinics": 3, "maxPatients": 999999, "aiRequestLimit": 50, "isFeatured": true}}'::jsonb, 
ARRAY['إدارة حتى 3 عيادات', 'ملفات مرضى بلا حدود', 'تذكيرات واتساب آلي', 'تحليل ذكي للإيرادات', 'دعم فني 24/7', 'ذكاء اصطناعي (50 طلب يومياً)'], true, 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name_en = 'Premium Plan');

INSERT INTO subscription_plans (name, name_en, price, features, is_popular, duration)
SELECT 'الباقة المتكاملة', 'Enterprise Plan', '{"monthly": 100000, "currency": "د.ع", "settings": {"maxClinics": 999, "maxPatients": 999999, "aiRequestLimit": -1, "isFeatured": true, "digitalBooking": true}}'::jsonb, 
ARRAY['عيادات غير محدودة', 'كل المميزات السابقة', 'ذكاء اصطناعي غير محدود', 'نظام حجز رقمي متكامل', 'تطبيق خاص للمرضى', 'أولوية قصوى في الدعم'], false, 'monthly'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name_en = 'Enterprise Plan');

-- 3. Seed Payment Methods
INSERT INTO payment_methods (name, type, number, is_active, details)
SELECT 'ZainCash', 'manual', '07800000000', true, '{"instructions": "يرجى إرسال المبلغ مع ذكر الاسم ورقم الهاتف في الملاحظات"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE name = 'ZainCash');

INSERT INTO payment_methods (name, type, number, is_active, details)
SELECT 'QiCard (Rafidain)', 'manual', '1234-5678-9012-3456', true, '{"instructions": "التحويل عبر خدمات مصرف الرافدين"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE name LIKE 'QiCard%');

-- Note: 'Agent' payment is usually handled dynamically by listing agents, but we can add a placeholder method if needed.
-- We won't add it as a 'method' row if the UI hardcodes the 'Agent' tab logic, but having it here makes it editable.
-- Let's stick to the 2 physical methods + the Agents system unless user requested "Agent" to be in this table specifically.
-- User said "transfer the 3 payment methods".
