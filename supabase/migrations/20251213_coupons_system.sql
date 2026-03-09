-- Create Coupons Table
CREATE TABLE IF NOT EXISTS public.store_coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
    discount_value NUMERIC NOT NULL,
    min_order_value NUMERIC DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active', -- active, expired, disabled
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.store_coupons ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage coupons" ON public.store_coupons
    FOR ALL USING (auth.email() LIKE '%admin%');

CREATE POLICY "Public can read active coupons" ON public.store_coupons
    FOR SELECT USING (status = 'active');

-- Index
CREATE INDEX idx_coupons_code ON public.store_coupons(code);

-- Seed Coupons
INSERT INTO public.store_coupons (code, discount_type, discount_value, min_order_value, usage_limit, status)
VALUES 
('WELCOME10', 'percentage', 10, 0, 1000, 'active'),
('FLASH25', 'percentage', 25, 50000, 50, 'active'),
('SAVE5000', 'fixed', 5000, 100000, 100, 'active');
