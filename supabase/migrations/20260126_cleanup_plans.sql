-- 20260126_cleanup_plans.sql

-- Delete plans that don't have the standard English names we just seeded
-- This cleans up old 'Basic Plan' or 'Pro Plan' entries that might have NULL name_en
DELETE FROM subscription_plans 
WHERE name_en IS NULL 
   OR name_en NOT IN ('Basic Plan', 'Premium Plan', 'Enterprise Plan');
