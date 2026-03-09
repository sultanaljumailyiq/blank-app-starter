-- Master Migration for 20260209
-- Includes:
-- 1. Brands Schema
-- 2. Emergency Centers Schema
-- 3. Products Schema Update (Columns + Categories)
-- 4. Deal Requests Schema
-- 5. Store Orders RLS Fix

BEGIN;

-- ========================================
-- 1. BRANDS SCHEMA
-- ========================================

CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    logo TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if table exists but columns missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'is_verified') THEN
        ALTER TABLE brands ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'logo') THEN
        ALTER TABLE brands ADD COLUMN logo TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'description') THEN
        ALTER TABLE brands ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'created_by') THEN
        ALTER TABLE brands ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read verified brands" ON brands;
CREATE POLICY "Public read verified brands" ON brands FOR SELECT USING (is_verified = true);

DROP POLICY IF EXISTS "Authenticated read all brands" ON brands;
CREATE POLICY "Authenticated read all brands" ON brands FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated insert brands" ON brands;
CREATE POLICY "Authenticated insert brands" ON brands FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users update own unverified brands" ON brands;
CREATE POLICY "Users update own unverified brands" ON brands FOR UPDATE TO authenticated USING (created_by = auth.uid() AND is_verified = false);


-- ========================================
-- 2. EMERGENCY CENTERS SCHEMA
-- ========================================

CREATE TABLE IF NOT EXISTS public.emergency_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('government', 'private')),
    phone TEXT,
    address TEXT,
    governorate TEXT,
    location JSONB,
    working_hours TEXT,
    is_24h BOOLEAN DEFAULT false,
    services TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.emergency_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.emergency_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to active emergency centers" ON emergency_centers;
CREATE POLICY "Allow public read access to active emergency centers" ON emergency_centers FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Allow admin full access to emergency centers" ON emergency_centers;
CREATE POLICY "Allow admin full access to emergency centers" ON emergency_centers USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);

DROP POLICY IF EXISTS "Allow public read access to emergency settings" ON emergency_settings;
CREATE POLICY "Allow public read access to emergency settings" ON emergency_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin full access to emergency settings" ON emergency_settings;
CREATE POLICY "Allow admin full access to emergency settings" ON emergency_settings USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);

INSERT INTO public.emergency_settings (key, value) VALUES ('hotline', '{"number": "07700000000", "is_active": true}'::jsonb) ON CONFLICT (key) DO NOTHING;


-- ========================================
-- 3. PRODUCTS SCHEMA UPDATE
-- ========================================

-- Add columns to products if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN ALTER TABLE products ADD COLUMN image_url TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sub_category') THEN ALTER TABLE products ADD COLUMN sub_category TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'child_category') THEN ALTER TABLE products ADD COLUMN child_category TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'brand_id') THEN ALTER TABLE products ADD COLUMN brand_id UUID; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_new') THEN ALTER TABLE products ADD COLUMN is_new BOOLEAN DEFAULT true; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_new_request') THEN ALTER TABLE products ADD COLUMN is_new_request BOOLEAN DEFAULT false; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_featured_request') THEN ALTER TABLE products ADD COLUMN is_featured_request BOOLEAN DEFAULT false; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_offer_request') THEN ALTER TABLE products ADD COLUMN is_offer_request BOOLEAN DEFAULT false; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'offer_request_percentage') THEN ALTER TABLE products ADD COLUMN offer_request_percentage INTEGER DEFAULT 0; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'target_audience') THEN ALTER TABLE products ADD COLUMN target_audience TEXT[] DEFAULT ARRAY['clinic', 'lab']; END IF;
END $$;

-- Create Product Categories Table
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_ar TEXT,
    parent_id UUID REFERENCES product_categories(id),
    level INTEGER DEFAULT 1,
    icon TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all product_categories" ON product_categories;
CREATE POLICY "Allow all product_categories" ON product_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);


-- ========================================
-- 4. DEAL REQUESTS SCHEMA
-- ========================================

CREATE TABLE IF NOT EXISTS deal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    discount_percentage INTEGER NOT NULL DEFAULT 10,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure deal_requests columns exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deal_requests' AND column_name = 'end_date') THEN ALTER TABLE deal_requests ADD COLUMN end_date DATE; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deal_requests' AND column_name = 'start_date') THEN ALTER TABLE deal_requests ADD COLUMN start_date DATE; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deal_requests' AND column_name = 'discount_percentage') THEN ALTER TABLE deal_requests ADD COLUMN discount_percentage INTEGER DEFAULT 10; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deal_requests' AND column_name = 'notes') THEN ALTER TABLE deal_requests ADD COLUMN notes TEXT; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deal_requests' AND column_name = 'status') THEN ALTER TABLE deal_requests ADD COLUMN status VARCHAR(20) DEFAULT 'pending'; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deal_requests' AND column_name = 'reviewed_by') THEN ALTER TABLE deal_requests ADD COLUMN reviewed_by UUID; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deal_requests' AND column_name = 'reviewed_at') THEN ALTER TABLE deal_requests ADD COLUMN reviewed_at TIMESTAMPTZ; END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deal_requests' AND column_name = 'admin_notes') THEN ALTER TABLE deal_requests ADD COLUMN admin_notes TEXT; END IF;
END $$;

ALTER TABLE deal_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow read deal_requests" ON deal_requests;
DROP POLICY IF EXISTS "Allow insert deal_requests" ON deal_requests;
DROP POLICY IF EXISTS "Allow update deal_requests" ON deal_requests;
CREATE POLICY "Allow read deal_requests" ON deal_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow insert deal_requests" ON deal_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow update deal_requests" ON deal_requests FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Promotion Requests
CREATE TABLE IF NOT EXISTS promotion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    request_type VARCHAR(30) NOT NULL CHECK (request_type IN ('new_badge', 'featured', 'exclusive', 'discount')),
    details JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE promotion_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all promotion_requests" ON promotion_requests;
CREATE POLICY "Allow all promotion_requests" ON promotion_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ========================================
-- 5. STORE ORDERS RLS FIX
-- ========================================

ALTER TABLE store_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create their own orders" ON store_orders;
CREATE POLICY "Users can create their own orders" ON store_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own orders" ON store_orders;
CREATE POLICY "Users can view their own orders" ON store_orders FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Suppliers can view their assigned orders" ON store_orders;
CREATE POLICY "Suppliers can view their assigned orders" ON store_orders FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM suppliers WHERE id = store_orders.supplier_id AND (user_id = auth.uid() OR profile_id = auth.uid()))
);

DROP POLICY IF EXISTS "Users can add items to their orders" ON store_order_items;
CREATE POLICY "Users can add items to their orders" ON store_order_items FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM store_orders WHERE id = store_order_items.order_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view items of their orders" ON store_order_items;
CREATE POLICY "Users can view items of their orders" ON store_order_items FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM store_orders WHERE id = store_order_items.order_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Suppliers can view items of their orders" ON store_order_items;
CREATE POLICY "Suppliers can view items of their orders" ON store_order_items FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM store_orders JOIN suppliers ON store_orders.supplier_id = suppliers.id WHERE store_orders.id = store_order_items.order_id AND (suppliers.user_id = auth.uid() OR suppliers.profile_id = auth.uid()))
);


COMMIT;
