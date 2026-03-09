-- Ensure Store Orders Table Exists with ALL columns
DROP TABLE IF EXISTS store_orders CASCADE;
CREATE TABLE store_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    user_name TEXT,
    supplier_id UUID, -- Loose reference to allow demo data / seed products without real users
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status TEXT CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')) DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    shipping_address JSONB,
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure Store Order Items Table Exists
DROP TABLE IF EXISTS store_order_items CASCADE;
CREATE TABLE store_order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES store_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure Shipping Addresses Table Exists
CREATE TABLE IF NOT EXISTS shipping_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL, -- e.g. "Clinic", "Lab", "Home"
    governorate TEXT,
    city TEXT,
    address TEXT,
    phone TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure Clinic Members (Mock/Real)
DROP TABLE IF EXISTS clinic_members CASCADE;
CREATE TABLE clinic_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    clinic_id UUID, -- REFERENCES clinics(id) - loose reference to avoid dependency hell if clinics table missing
    role TEXT DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE clinic_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public view members" ON clinic_members FOR SELECT TO authenticated USING (true);


-- Enable RLS
ALTER TABLE store_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can insert their own orders" ON store_orders;
CREATE POLICY "Users can insert their own orders" ON store_orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own orders" ON store_orders;
CREATE POLICY "Users can view their own orders" ON store_orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = supplier_id);

DROP POLICY IF EXISTS "Users can update own orders" ON store_orders;
CREATE POLICY "Users can update own orders" ON store_orders FOR UPDATE TO authenticated USING (auth.uid() = user_id OR auth.uid() = supplier_id);

DROP POLICY IF EXISTS "Users can insert order items" ON store_order_items;
CREATE POLICY "Users can insert order items" ON store_order_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM store_orders WHERE id = order_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can view order items" ON store_order_items;
CREATE POLICY "Users can view order items" ON store_order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM store_orders WHERE id = order_id AND (user_id = auth.uid() OR supplier_id = auth.uid())));

DROP POLICY IF EXISTS "Users can manage addresses" ON shipping_addresses;
CREATE POLICY "Users can manage addresses" ON shipping_addresses FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Fix Product columns for requests (Idempotent)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_new') THEN
        ALTER TABLE products ADD COLUMN is_new BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_featured') THEN
        ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'discount') THEN
        ALTER TABLE products ADD COLUMN discount INTEGER DEFAULT 0;
    END IF;
     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_new_request') THEN
        ALTER TABLE products ADD COLUMN is_new_request BOOLEAN DEFAULT false;
    END IF;
     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_featured_request') THEN
        ALTER TABLE products ADD COLUMN is_featured_request BOOLEAN DEFAULT false;
    END IF;
     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_offer_request') THEN
        ALTER TABLE products ADD COLUMN is_offer_request BOOLEAN DEFAULT false;
    END IF;
     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'offer_request_percentage') THEN
        ALTER TABLE products ADD COLUMN offer_request_percentage INTEGER DEFAULT 0;
    END IF;
END $$;

