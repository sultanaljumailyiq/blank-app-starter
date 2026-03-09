-- Create deal_requests table
CREATE TABLE IF NOT EXISTS public.deal_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    discount_percentage NUMERIC NOT NULL,
    duration_days INTEGER DEFAULT 7,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create store_coupons table
CREATE TABLE IF NOT EXISTS public.store_coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC NOT NULL,
    min_order_value NUMERIC DEFAULT 0,
    usage_limit INTEGER DEFAULT 100,
    used_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disabled')),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.deal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_coupons ENABLE ROW LEVEL SECURITY;

-- Policies for deal_requests
CREATE POLICY "Admins can view all deal requests" ON public.deal_requests FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update deal requests" ON public.deal_requests FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Suppliers can view their own requests" ON public.deal_requests FOR SELECT USING (
    supplier_id IN (SELECT id FROM public.suppliers WHERE user_id = auth.uid())
);
CREATE POLICY "Suppliers can create requests" ON public.deal_requests FOR INSERT WITH CHECK (
    supplier_id IN (SELECT id FROM public.suppliers WHERE user_id = auth.uid())
);

-- Policies for store_coupons
CREATE POLICY "Admins can manage coupons" ON public.store_coupons FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Public can view active coupons" ON public.store_coupons FOR SELECT USING (
    status = 'active'
);
