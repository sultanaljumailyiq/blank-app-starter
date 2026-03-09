-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id), -- Link to auth user if they manage it
    name TEXT NOT NULL,
    description TEXT,
    logo TEXT,
    cover_image TEXT,
    phone TEXT,
    email TEXT,
    location TEXT,
    governorate TEXT,
    is_verified BOOLEAN DEFAULT false,
    rating NUMERIC DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Brands Table
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo TEXT,
    description TEXT,
    country TEXT,
    website TEXT,
    is_verified BOOLEAN DEFAULT false, -- True for admin-approved brands
    created_by UUID REFERENCES auth.users(id), -- Use user_id generally, or supplier_id if specific logic needed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    discount NUMERIC DEFAULT 0,
    stock INTEGER DEFAULT 0,
    category TEXT,
    images TEXT[], -- Multiple images
    cover_image TEXT, -- Main thumbnail
    
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    
    is_featured BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true, -- Soft delete/hiding
    
    technical_details JSONB DEFAULT '{}'::JSONB, -- For extra specs
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Store Orders Table
CREATE TABLE IF NOT EXISTS store_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending',
    shipping_address JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS store_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES store_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    supplier_id UUID REFERENCES suppliers(id), -- Snapshot for easy querying supplier orders
    quantity INTEGER NOT NULL,
    price_at_purchase NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies

-- Suppliers: Public Read, Owner Write (if linked)
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read suppliers" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Admin/Owner update suppliers" ON suppliers FOR UPDATE USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'service_role');

-- Brands: Public Read, Auth Create
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Authenticated create brands" ON brands FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins update brands" ON brands FOR UPDATE USING (auth.jwt() ->> 'role' = 'service_role'); -- Or specific admin role logic

-- Products: Public Read, Supplier Write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Suppliers manage own products" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM suppliers WHERE id = products.supplier_id AND user_id = auth.uid())
);

-- Orders: Owner Read/Create
ALTER TABLE store_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own orders" ON store_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own orders" ON store_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE store_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own order items" ON store_order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM store_orders WHERE id = store_order_items.order_id AND user_id = auth.uid())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
