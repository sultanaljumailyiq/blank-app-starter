-- Migration: Add Brands and Seed Professional Store Data
-- Description: Creates brands table, updates products, and seeds real-world dental data.

-- 1. Create Brands Table
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    logo TEXT,
    description TEXT,
    country TEXT,
    website TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.1 Ensure Suppliers Table has necessary columns for Demo
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'logo') THEN
        ALTER TABLE suppliers ADD COLUMN logo TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'suppliers' AND column_name = 'cover_image') THEN
        ALTER TABLE suppliers ADD COLUMN cover_image TEXT;
    END IF;
END $$;

-- 2. Add brand_id to Products if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'brand_id') THEN
        ALTER TABLE products ADD COLUMN brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Enable RLS on brands
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Suppliers manage brands" ON brands FOR ALL USING (true); -- Simplify for demo

-- 3. Seed Data
-- Clear existing store data for a clean slate (Optional - comment out if preserving)
TRUNCATE products, brands, suppliers CASCADE;

-- Insert Suppliers
INSERT INTO suppliers (id, company_name, contact_person, email, phone, category, address, status, commission_percentage, total_sales, rating, description, verified, logo, cover_image)
VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'شركة النور للمستلزمات الطبية', 'د. محمد النور', 'info@alnoor-med.com', '07701234567', 'معدات وأدوات', 'بغداد - شارع السعدون', 'approved', 5, 125000000, 4.9, 'المورد الأول لمعدات الأسنان في العراق، وكيل حصري لشركات عالمية.', true, 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200', 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=1200'),
    
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'مذخر دجلة المركزي', 'ص. علي حسين', 'sales@dijlah-store.com', '07901112222', 'مستهلكات طبية', 'بغداد - الحارثية', 'approved', 3, 45000000, 4.7, 'توفر جميع المواد الاستهلاكية للعيادات بأسعار تنافسية وتوصيل سريع.', true, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&q=80&w=1200'),
    
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'مركز أربيل للتقنيات السنية', 'م. عمر فاد', 'tech@erbil-dental.com', '07503334444', 'تقنيات حديثة', 'أربيل - 100 متر', 'approved', 4, 85000000, 4.8, 'متخصصون في أجهزة الكاد كام والطباعة ثلاثية الأبعاد.', true, 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200');

-- Insert Brands
INSERT INTO brands (id, supplier_id, name, country, description, is_verified)
VALUES
    -- Al Noor Brands
    ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '3M ESPE', 'USA', 'Global leader in dental materials', true),
    ('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Dentsply Sirona', 'USA', 'Professional dental products and technologies', true),
    
    -- Dijlah Brands
    ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'GC', 'Japan', 'High quality dental materials', true),
    ('d4eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Kerr', 'USA', 'Restorative dental products', true),

    -- Erbil Brands
    ('d5eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Planmeca', 'Finland', 'High-tech dental equipment', true),
    ('d6eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Ivoclar', 'Liechtenstein', 'Innovative material systems', true);

-- Insert Products
INSERT INTO products (supplier_id, brand_id, name, description, price, category, stock, is_new, is_featured, rating, reviews_count, images, discount_percentage)
VALUES
    -- Al Noor / 3M & Dentsply
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Filtek Z350 XT Kit', 'حشوة تجميلية نانو كومبوزيت شاملة الألوان - طقم كامل', 450000, 'حشوات', 50, true, true, 4.9, 120, ARRAY['https://m.media-amazon.com/images/I/61N+RjF9WXL._AC_UF1000,1000_QL80_.jpg'], 10),
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Single Bond Universal', 'لاصق عالمي لجميع أنواع الحشوات 5ml', 65000, 'مواد', 100, false, true, 4.8, 85, ARRAY['https://www.3m.com.sa/3m_images/v1/20210315/p1-single-bond-universal-adhesive-bottle-refill-41258.jpg'], 0),
    
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd2eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'X-Smart Plus Motor', 'جهاز روتاري إندو لاسلكي متطور مع إضاءة', 1200000, 'أجهزة', 15, true, true, 5.0, 45, ARRAY['https://www.dentsplysirona.com/content/dam/dentsplysirona/dtds/products/endodontics/motors/x-smart-plus/X-Smart-Plus-Motor-Handpiece.png'], 5),

    -- Dijlah / GC & Kerr
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'G-Baryte Glass Ionomer', 'حشوة زجاجية عالية الصلابة للأضراس الخلفية', 55000, 'حشوات', 200, false, false, 4.6, 60, ARRAY['https://www.gc.dental/america/sites/default/files/styles/product_full_width/public/2021-03/Fuji-IX-GP.jpg'], 0),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'GC Fujicem 2', 'سيمنت لاصق للتيجان والجسور أوتوميكس', 95000, 'مواد', 80, true, false, 4.8, 30, ARRAY['https://www.gc.dental/america/sites/default/files/2020-11/FujiCEM2_SL.jpg'], 15),

    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'd4eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'OptiBond Solo Plus', 'لاصق الجيل الخامس عبوة 5ml', 50000, 'مواد', 120, false, true, 4.7, 200, ARRAY['https://www.kerrdental.com/sites/default/files/styles/product_detail_image/public/2019-12/OptiBond_Solo_Plus_Family.png'], 0),

    -- Erbil / Equipment
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'd5eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Planmeca Compact i5', 'كرسي أسنان متكامل مع وحدة أشعة مدمجة', 18500000, 'أجهزة', 3, true, true, 5.0, 10, ARRAY['https://www.planmeca.com/siteassets/dental-units/planmeca-compact-i5/planmeca-compact-i5-dental-unit-blue.jpg'], 0),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'd6eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Bluephase N', 'جهاز تصليب ضوئي عالي الشدة LED', 450000, 'أجهزة', 25, false, true, 4.8, 55, ARRAY['https://www.ivoclar.com/globalassets/marketplace/vivadent/bluephase/bluephase-n/bluephase-n-g4-grey.png'], 10);
