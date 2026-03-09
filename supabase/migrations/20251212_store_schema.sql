-- Create Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    stock INTEGER DEFAULT 0,
    category TEXT NOT NULL,
    images TEXT[], -- Array of image URLs
    is_new BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    discount_percentage INTEGER DEFAULT 0,
    rating DECIMAL(2, 1) DEFAULT 0.0,
    reviews_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active', -- active, draft, archived
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL, -- Link to auth.users in production
    user_name TEXT, -- Denormalized for display
    supplier_id UUID REFERENCES suppliers(id), -- For multi-vendor, orders might need to be split, but for simplicity we'll link primarily or handle split in app logic by creating multiple orders per cart checkout
    total_amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
    payment_status TEXT DEFAULT 'pending', -- pending, paid, failed, refunded
    shipping_address JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Reviews Table
CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Policies (Development: Permissive)
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Suppliers manage products" ON products FOR ALL USING (true); -- simplify for demo

CREATE POLICY "Users manage own orders" ON orders FOR ALL USING (true); -- simplify
CREATE POLICY "Users manage own order items" ON order_items FOR ALL USING (true); -- simplify

CREATE POLICY "Public read reviews" ON product_reviews FOR SELECT USING (true);
CREATE POLICY "Users write reviews" ON product_reviews FOR INSERT WITH CHECK (true);

-- Seed Data (Products)
-- We need a supplier ID first. In a real migration we might query it, but for seed we'll insert a dummy supplier if none exists or rely on the previous migration's seed.
-- Assuming previous migration created at least one supplier. We'll grab the first one dynamically in a DO block if possible, or just insert new ones with known IDs for the seed.

DO $$
DECLARE
    sup_id UUID;
BEGIN
    -- Try to get an existing supplier, or create one for the store seed
    SELECT id INTO sup_id FROM suppliers LIMIT 1;
    
    IF sup_id IS NULL THEN
        INSERT INTO suppliers (company_name, email, status, rating, generated_id)
        VALUES ('مذخر دجلة', 'store_seed@example.com', 'active', 4.8, gen_random_uuid())
        RETURNING id INTO sup_id;
    END IF;

    -- Insert Products
    INSERT INTO products (supplier_id, name, description, price, category, stock, images, is_new, is_featured, rating, reviews_count)
    VALUES
    (sup_id, 'جهاز أشعة بانوراما', 'جهاز أشعة متطور للتصوير البانورامي', 15000000, 'أجهزة', 5, ARRAY['https://images.unsplash.com/photo-1516549655169-df83a25a8396?auto=format&fit=crop&q=80&w=300&h=300'], true, true, 4.9, 12),
    (sup_id, 'كرسي طبيب أسنان', 'كرسي مريح مع وحدة تحكم كاملة', 4500000, 'أجهزة', 10, ARRAY['https://images.unsplash.com/photo-1517120026326-d87759a7b63b?auto=format&fit=crop&q=80&w=300&h=300'], false, true, 4.7, 8),
    (sup_id, 'حشوة كومبوزيت', 'حشوة ضوئية عالية الجودة - طقم كامل', 45000, 'مواد', 150, ARRAY['https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=300&h=300'], true, false, 4.5, 45),
    (sup_id, 'أدوات خلع', 'طقم أدوات خلع جراحي ستانلس ستيل', 120000, 'أدوات', 30, ARRAY['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=300&h=300'], false, false, 4.8, 20);

END $$;
