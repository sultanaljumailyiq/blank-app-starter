-- 20260128_fix_plan_limits_schema.sql

-- 1. Rename 'limits' to avoid reserved keywords if any, but 'limits' is generally safe.
-- However, we verified 'features' conflict. 'features' exists as TEXT[].

-- We successfully added 'limits' JSONB (assuming no conflict there).
-- We failed to add 'features' JSONB likely, or if added, it's ambiguous.
-- Let's check if 'limits' exists.

DO $$ 
BEGIN
    -- Ensure limits column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'limits') THEN
        ALTER TABLE subscription_plans ADD COLUMN limits JSONB DEFAULT '{"max_clinics": 1, "max_patients": 500, "max_services": 10, "max_ai": 0}'::jsonb;
    END IF;

    -- Add gated_features column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'gated_features') THEN
        ALTER TABLE subscription_plans ADD COLUMN gated_features JSONB DEFAULT '{"map": false, "booking": false, "featured": false, "articles": false}'::jsonb;
    END IF;
END $$;

-- 2. Migrate existing data to new columns

-- Basic Plan
UPDATE subscription_plans 
SET 
  limits = '{"max_clinics": 1, "max_patients": 500, "max_services": 20, "max_ai": 0}'::jsonb,
  gated_features = '{"map": false, "booking": false, "featured": false, "articles": false}'::jsonb
WHERE slug = 'basic-plan' OR name_en = 'Basic Plan';

-- Premium Plan
UPDATE subscription_plans 
SET 
  limits = '{"max_clinics": 3, "max_patients": 10000, "max_services": 50, "max_ai": 50}'::jsonb,
  gated_features = '{"map": true, "booking": true, "featured": false, "articles": false}'::jsonb
WHERE slug = 'premium-plan' OR name_en = 'Premium Plan';

-- Enterprise Plan
UPDATE subscription_plans 
SET 
  limits = '{"max_clinics": 100, "max_patients": 1000000, "max_services": 1000, "max_ai": -1}'::jsonb,
  gated_features = '{"map": true, "booking": true, "featured": true, "articles": true}'::jsonb
WHERE slug = 'enterprise-plan' OR name_en = 'Enterprise Plan';
