-- Supplier Store Schema

-- 1. Suppliers Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    description TEXT,
    phone TEXT,
    city TEXT,
    address TEXT,
    logo_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Supplier Products Table
CREATE TABLE IF NOT EXISTS public.supplier_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    category TEXT,
    sub_category TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    discount DECIMAL(5, 2) DEFAULT 0,
    target_audience TEXT[] DEFAULT ARRAY['clinic', 'lab'], -- 'clinic', 'lab', 'both'
    views INTEGER DEFAULT 0,
    sales INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS Policies

-- Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;

-- Suppliers Policies
-- Everyone can view verified suppliers
CREATE POLICY "Public can view verified suppliers" ON public.suppliers
    FOR SELECT USING (true);

-- Suppliers can update their own profile
CREATE POLICY "Suppliers can update own profile" ON public.suppliers
    FOR UPDATE USING (auth.uid() = id);

-- Supplier Products Policies
-- Everyone can view active products
CREATE POLICY "Public can view active products" ON public.supplier_products
    FOR SELECT USING (is_active = true);

-- Suppliers can manage their own products
CREATE POLICY "Suppliers can insert own products" ON public.supplier_products
    FOR INSERT WITH CHECK (auth.uid() = supplier_id);

CREATE POLICY "Suppliers can update own products" ON public.supplier_products
    FOR UPDATE USING (auth.uid() = supplier_id);

CREATE POLICY "Suppliers can delete own products" ON public.supplier_products
    FOR DELETE USING (auth.uid() = supplier_id);

-- 4. Triggers for Updated At
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_suppliers_modtime
    BEFORE UPDATE ON public.suppliers
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_supplier_products_modtime
    BEFORE UPDATE ON public.supplier_products
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
