
-- Check Subscription Plans and their Limits
SELECT id, name, name_en, price, limits, features FROM subscription_plans;

-- Check if any AI usage logs exist
SELECT * FROM ai_usage_logs LIMIT 5;

-- Check AI Agents (Configuration)
SELECT * FROM ai_agents;
