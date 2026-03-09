-- Secure Admin Tables (Agents, Payment Methods, Subscriptions)
-- Replaces previous insecure "authenticated" policies with strict Admin checks

-- 1. Helper Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Secure "agents" table
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to agents" ON agents;
DROP POLICY IF EXISTS "Allow authenticated insert to agents" ON agents;
DROP POLICY IF EXISTS "Allow authenticated update to agents" ON agents;
DROP POLICY IF EXISTS "Allow authenticated delete to agents" ON agents;

CREATE POLICY "Public Read Agents" ON agents FOR SELECT USING (true);
CREATE POLICY "Admin Manage Agents" ON agents FOR ALL USING (public.is_admin());


-- 3. Secure "payment_methods" table
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "Allow authenticated insert to payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "Allow authenticated update to payment_methods" ON payment_methods;

CREATE POLICY "Public Read Payment Methods" ON payment_methods FOR SELECT USING (true);
CREATE POLICY "Admin Manage Payment Methods" ON payment_methods FOR ALL USING (public.is_admin());


-- 4. Secure "subscription_plans" table
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read plans" ON subscription_plans;
DROP POLICY IF EXISTS "Admin all plans" ON subscription_plans;

CREATE POLICY "Public Read Plans" ON subscription_plans FOR SELECT USING (true);
CREATE POLICY "Admin Manage Plans" ON subscription_plans FOR ALL USING (public.is_admin());


-- 5. Secure "coupons" table
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read coupons" ON coupons;
DROP POLICY IF EXISTS "Admin all coupons" ON coupons;

CREATE POLICY "Public Read Coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Admin Manage Coupons" ON coupons FOR ALL USING (public.is_admin());


-- 6. Secure "subscription_requests" table
-- Doctors can create and read their own. Admins can see/manage all.
ALTER TABLE subscription_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors see own requests" ON subscription_requests;
DROP POLICY IF EXISTS "Doctors create requests" ON subscription_requests;
DROP POLICY IF EXISTS "Admin all requests" ON subscription_requests;

CREATE POLICY "Doctors View Own Requests" ON subscription_requests 
FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors Create Requests" ON subscription_requests 
FOR INSERT WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Admin Manage Requests" ON subscription_requests 
FOR ALL USING (public.is_admin());
