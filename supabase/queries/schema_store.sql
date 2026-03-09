-- ==============================================================================
-- STORE & SUPPLIER SCHEMA (Fixed)
-- ==============================================================================

-- 1. Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    cover_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    city TEXT,
    category TEXT, 
    rating DECIMAL(2,1) DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending', 
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read suppliers" ON suppliers;
CREATE POLICY "Public read suppliers" ON suppliers FOR SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Supplier update own" ON suppliers;
CREATE POLICY "Supplier update own" ON suppliers FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Supplier insert own" ON suppliers;
CREATE POLICY "Supplier insert own" ON suppliers FOR INSERT WITH CHECK (user_id = auth.uid());

-- 2. Brands
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    country TEXT,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read brands" ON brands;
CREATE POLICY "Public read brands" ON brands FOR SELECT USING (true);

DROP POLICY IF EXISTS "Supplier manage brands" ON brands;
CREATE POLICY "Supplier manage brands" ON brands FOR ALL USING (supplier_id IN (SELECT id FROM suppliers WHERE user_id = auth.uid()));

-- 3. Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    images TEXT[], 
    category TEXT NOT NULL, 
    sub_category TEXT,
    stock_quantity INTEGER DEFAULT 0,
    track_stock BOOLEAN DEFAULT true,
    sku TEXT,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    rating DECIMAL(2,1) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Supplier manage products" ON products;
CREATE POLICY "Supplier manage products" ON products FOR ALL USING (supplier_id IN (SELECT id FROM suppliers WHERE user_id = auth.uid()));

-- 4. Store Orders
CREATE TABLE IF NOT EXISTS store_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    status TEXT DEFAULT 'pending', 
    payment_status TEXT DEFAULT 'unpaid',
    order_date TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE store_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinic view orders" ON store_orders;
CREATE POLICY "Clinic view orders" ON store_orders FOR SELECT USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

DROP POLICY IF EXISTS "Supplier view orders" ON store_orders;
CREATE POLICY "Supplier view orders" ON store_orders FOR ALL USING (supplier_id IN (SELECT id FROM suppliers WHERE user_id = auth.uid()));

-- 5. Order Items
CREATE TABLE IF NOT EXISTS store_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES store_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);
ALTER TABLE store_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View order items" ON store_order_items;
CREATE POLICY "View order items" ON store_order_items FOR SELECT USING (order_id IN (SELECT id FROM store_orders));
