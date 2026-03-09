-- Comprehensive Products Schema Fix
-- Migration: 20260209_fix_products_complete.sql
-- Adds all missing columns required by the supplier product management

-- ========================================
-- ADD MISSING COLUMNS TO PRODUCTS TABLE
-- ========================================

-- image_url column for product image
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
        ALTER TABLE products ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Added image_url column';
    END IF;
END $$;

-- sub_category for product subcategory
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sub_category') THEN
        ALTER TABLE products ADD COLUMN sub_category TEXT;
        RAISE NOTICE 'Added sub_category column';
    END IF;
END $$;

-- child_category for nested category support
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'child_category') THEN
        ALTER TABLE products ADD COLUMN child_category TEXT;
        RAISE NOTICE 'Added child_category column';
    END IF;
END $$;

-- brand_id for product brand
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'brand_id') THEN
        ALTER TABLE products ADD COLUMN brand_id UUID;
        RAISE NOTICE 'Added brand_id column';
    END IF;
END $$;

-- is_new flag
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_new') THEN
        ALTER TABLE products ADD COLUMN is_new BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_new column';
    END IF;
END $$;

-- is_new_request for new badge request
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_new_request') THEN
        ALTER TABLE products ADD COLUMN is_new_request BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_new_request column';
    END IF;
END $$;

-- is_featured_request for featured badge request
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_featured_request') THEN
        ALTER TABLE products ADD COLUMN is_featured_request BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_featured_request column';
    END IF;
END $$;

-- is_offer_request for offer request
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_offer_request') THEN
        ALTER TABLE products ADD COLUMN is_offer_request BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_offer_request column';
    END IF;
END $$;

-- offer_request_percentage for requested discount percentage
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'offer_request_percentage') THEN
        ALTER TABLE products ADD COLUMN offer_request_percentage INTEGER DEFAULT 0;
        RAISE NOTICE 'Added offer_request_percentage column';
    END IF;
END $$;

-- target_audience for product targeting (clinic, lab, etc)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'target_audience') THEN
        ALTER TABLE products ADD COLUMN target_audience TEXT[] DEFAULT ARRAY['clinic', 'lab'];
        RAISE NOTICE 'Added target_audience column';
    END IF;
END $$;

-- ========================================
-- PRODUCT CATEGORIES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_ar TEXT,
    parent_id UUID REFERENCES product_categories(id),
    level INTEGER DEFAULT 1, -- 1: main, 2: sub, 3: child
    icon TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all product_categories" ON product_categories;
CREATE POLICY "Allow all product_categories" ON product_categories
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT ALL ON product_categories TO authenticated;

-- ========================================
-- PRODUCT BRANDS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS product_brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_ar TEXT,
    logo_url TEXT,
    country TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE product_brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all product_brands" ON product_brands;
CREATE POLICY "Allow all product_brands" ON product_brands
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT ALL ON product_brands TO authenticated;

-- ========================================
-- INSERT DEFAULT CATEGORIES
-- ========================================
INSERT INTO product_categories (name, name_ar, level, sort_order) VALUES
('مواد طب الأسنان', 'مواد طب الأسنان', 1, 1),
('أجهزة و معدات', 'أجهزة و معدات', 1, 2),
('أدوات يدوية', 'أدوات يدوية', 1, 3),
('مستهلكات', 'مستهلكات', 1, 4),
('تجهيزات العيادة', 'تجهيزات العيادة', 1, 5),
('مختبرات الأسنان', 'مختبرات الأسنان', 1, 6)
ON CONFLICT DO NOTHING;

-- ========================================
-- INSERT DEFAULT BRANDS
-- ========================================
INSERT INTO product_brands (name, name_ar, country) VALUES
('3M', '3M', 'USA'),
('Dentsply Sirona', 'دنتسبلي سيرونا', 'USA'),
('Ivoclar Vivadent', 'إيفوكلار فيفادنت', 'Liechtenstein'),
('GC Corporation', 'جي سي', 'Japan'),
('Kerr', 'كير', 'USA'),
('VOCO', 'فوكو', 'Germany'),
('Ultradent', 'ألترادنت', 'USA'),
('Coltene', 'كولتين', 'Switzerland')
ON CONFLICT DO NOTHING;

-- ========================================
-- CREATE STORAGE BUCKET FOR PRODUCTS (requires Supabase Dashboard)
-- This is a reminder - storage buckets must be created via Supabase Dashboard or API
-- ========================================
-- NOTE: Run these commands in Supabase SQL Editor with service_role:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('supplier-logos', 'supplier-logos', true);

-- Grant indices for performance
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
