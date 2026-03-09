-- Migration: Deals and Campaigns System
-- Created: 2025-12-12

-- 1. Create Promotional Cards Table
CREATE TABLE IF NOT EXISTS promotional_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    image TEXT, -- URL to image
    button_text TEXT DEFAULT 'تسوق الآن',
    link TEXT, -- Internal route link (e.g., /store/categories/x)
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Deal Requests Table (For Suppliers)
CREATE TABLE IF NOT EXISTS deal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deal', 'featured')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    badge_type TEXT, -- e.g., 'limited_time', 'special_offer', etc.
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add Deal and Featured fields to Products Table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_deal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deal_badge TEXT, -- 'sale', 'limited', 'new', 'hot'
ADD COLUMN IF NOT EXISTS deal_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deal_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_order INTEGER DEFAULT 0;

-- 4. RLS Policies

-- Promotional Cards: Public read, Admin write
ALTER TABLE promotional_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active promotional cards" 
ON promotional_cards FOR SELECT 
USING (active = true);

CREATE POLICY "Admins can manage promotional cards" 
ON promotional_cards FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin'); -- Assuming role-based auth or handle via specialized admin user check

-- Deal Requests: Suppliers create/read own, Admin read/write all
ALTER TABLE deal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Suppliers can view own requests" 
ON deal_requests FOR SELECT 
USING (auth.uid() = supplier_id); -- Assuming supplier_id matches auth.uid typically, or via mapped table

CREATE POLICY "Suppliers can create requests" 
ON deal_requests FOR INSERT 
WITH CHECK (auth.uid() = supplier_id);

CREATE POLICY "Admins can manage all deal requests" 
ON deal_requests FOR ALL 
USING (auth.jwt() ->> 'role' = 'admin');

-- 5. Seed Initial Promo Data (Optional Demo Data)
INSERT INTO promotional_cards (title, description, button_text, link, active)
VALUES 
('عروض نهاية السنة', 'تخفيضات تصل إلى 50% على جميع مواد الحشوات', 'تصفح العروض', '/store/deals', true),
('أحدث أجهزة الأشعة', 'تكنولوجيا متطورة لعيادة عصرية', 'شاهد المنتجات', '/store/categories/Radio', true),
('باقة التأسيس', 'خصم خاص عند تجهيز عيادة جديدة بالكامل', 'اطلب عرض سعر', '/store/contact', true);
