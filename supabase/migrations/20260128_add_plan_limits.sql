-- 20260128_add_plan_limits.sql

-- 1. Add new columns for structure limits and features
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS limits JSONB DEFAULT '{"max_clinics": 1, "max_patients": 100, "max_services": 10, "max_ai": 0}'::jsonb,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{"map": false, "booking": false, "featured": false, "articles": false}'::jsonb;

-- 2. Migrate existing data (Best Effort based on known plan names)

-- Basic Plan
UPDATE subscription_plans 
SET 
  limits = '{"max_clinics": 1, "max_patients": 500, "max_services": 20, "max_ai": 0}'::jsonb,
  features = '{"map": false, "booking": false, "featured": false, "articles": false}'::jsonb
WHERE slug = 'basic-plan' OR name_en = 'Basic Plan';

-- Premium Plan
UPDATE subscription_plans 
SET 
  limits = '{"max_clinics": 3, "max_patients": 10000, "max_services": 50, "max_ai": 50}'::jsonb,
  features = '{"map": true, "booking": true, "featured": false, "articles": false}'::jsonb
WHERE slug = 'premium-plan' OR name_en = 'Premium Plan';

-- Enterprise Plan
UPDATE subscription_plans 
SET 
  limits = '{"max_clinics": 100, "max_patients": 1000000, "max_services": 1000, "max_ai": -1}'::jsonb,
  features = '{"map": true, "booking": true, "featured": true, "articles": true}'::jsonb
WHERE slug = 'enterprise-plan' OR name_en = 'Enterprise Plan';

-- 3. Cleanup: Remove settings from price if desirable, but we will leave it for now for backward compatibility
-- We might update the price column to remove the nested settings later.
