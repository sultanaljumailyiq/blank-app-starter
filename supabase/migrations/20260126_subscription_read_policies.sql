-- Allow everyone (authenticated) to view subscription plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON subscription_plans
    FOR SELECT TO authenticated USING (true);

-- Allow everyone to view active payment methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON payment_methods
    FOR SELECT TO authenticated USING (true);

-- Allow everyone to view agents
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON agents
    FOR SELECT TO authenticated USING (true);

-- Allow everyone to view coupons (needed for application logic)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON coupons
    FOR SELECT TO authenticated USING (true);
