-- ==============================================================================
-- ADMIN & PLATFORM SCHEMA
-- ==============================================================================

-- 1. Subscription Plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- 'Free', 'Pro', 'Enterprise'
    slug TEXT UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    interval TEXT DEFAULT 'month', -- 'month', 'year'
    features JSONB DEFAULT '[]', -- List of features enabled
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read plans" ON subscription_plans;
CREATE POLICY "Public read plans" ON subscription_plans FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manage plans" ON subscription_plans;
CREATE POLICY "Admin manage plans" ON subscription_plans FOR ALL USING (is_admin());

-- 2. User Subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired'
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own subscription" ON user_subscriptions;
CREATE POLICY "Users read own subscription" ON user_subscriptions FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admin manage subscriptions" ON user_subscriptions;
CREATE POLICY "Admin manage subscriptions" ON user_subscriptions FOR ALL USING (is_admin());

-- 3. System Notifications
CREATE TABLE IF NOT EXISTS system_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
    is_read BOOLEAN DEFAULT false,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own notifications" ON system_notifications;
CREATE POLICY "Users manage own notifications" ON system_notifications FOR ALL USING (user_id = auth.uid());

-- 4. Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own tickets" ON support_tickets;
CREATE POLICY "Users manage own tickets" ON support_tickets FOR ALL USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins manage all tickets" ON support_tickets;
CREATE POLICY "Admins manage all tickets" ON support_tickets FOR ALL USING (is_admin());
