-- 20260126_subscription_system_upgrade.sql

-- 0. Ensure Plans Table Exists
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_en TEXT NOT NULL,
    price JSONB NOT NULL,
    features TEXT[] DEFAULT '{}',
    is_popular BOOLEAN DEFAULT false,
    duration TEXT DEFAULT 'monthly',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Ensure Agents Table Exists
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    governorate TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    clinics_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    join_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agents' AND column_name = 'code') THEN
        ALTER TABLE agents ADD COLUMN code TEXT UNIQUE;
        ALTER TABLE agents ADD COLUMN commission_rate NUMERIC DEFAULT 0;
    END IF;
END $$;

-- 2. Ensure Payment Methods Table Exists
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    number TEXT NOT NULL,
    qr_code_url TEXT DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_methods' AND column_name = 'type') THEN
        ALTER TABLE payment_methods ADD COLUMN type TEXT DEFAULT 'manual'; -- 'manual', 'gateway', 'agent'
        ALTER TABLE payment_methods ADD COLUMN details JSONB DEFAULT '{}'; 
    END IF;
END $$;

-- 3. Create Subscription Transactions Table
CREATE TABLE IF NOT EXISTS subscription_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID, 
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'IQD',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    provider_tx_id TEXT,
    provider_name TEXT, 
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Ensure Subscription Requests Table Exists
CREATE TABLE IF NOT EXISTS subscription_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Removed References to avoid issues if parent tables missing or named differently (e.g. profiles vs users) in this robust script. 
    -- Ideally we want references, but for robustness in this blind recovery, we can omit FKs or add them loosely.
    -- However, we referenced subscription_plans above so that's safe.
    doctor_id UUID, 
    plan_id UUID REFERENCES subscription_plans(id),
    doctor_name TEXT,
    clinic_name TEXT,
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    receipt_image_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Upgrade Subscription Requests
DO $$ 
BEGIN
    -- Agent ID
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_requests' AND column_name = 'agent_id') THEN
        ALTER TABLE subscription_requests ADD COLUMN agent_id UUID REFERENCES agents(id);
    END IF;

    -- Coupon ID
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_requests' AND column_name = 'coupon_id') THEN
        ALTER TABLE subscription_requests ADD COLUMN coupon_id UUID; 
    END IF;

    -- Transaction ID
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_requests' AND column_name = 'transaction_id') THEN
        ALTER TABLE subscription_requests ADD COLUMN transaction_id UUID REFERENCES subscription_transactions(id);
    END IF;
END $$;

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_requests ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
     -- Plans
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscription_plans' AND policyname = 'Public read plans') THEN
        CREATE POLICY "Public read plans" ON subscription_plans FOR SELECT USING (true);
    END IF;

    -- Agents
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'agents' AND policyname = 'Public read agents') THEN
        CREATE POLICY "Public read agents" ON agents FOR SELECT USING (true);
    END IF;
    
    -- Payment Methods
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_methods' AND policyname = 'Public read payment_methods') THEN
        CREATE POLICY "Public read payment_methods" ON payment_methods FOR SELECT USING (true);
    END IF;

    -- Transactions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscription_transactions' AND policyname = 'Admins view all transactions') THEN
        CREATE POLICY "Admins view all transactions" ON subscription_transactions FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    -- Requests
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscription_requests' AND policyname = 'Admins all requests') THEN
        CREATE POLICY "Admins all requests" ON subscription_requests FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Generate a random code for existing agents if any
UPDATE agents SET code = substring(md5(random()::text) from 1 for 8) WHERE code IS NULL;
