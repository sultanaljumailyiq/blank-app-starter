-- Marketplace Tables

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier Orders Table
CREATE TABLE IF NOT EXISTS supplier_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- The seller
  clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE, -- The buyer
  order_number TEXT NOT NULL,
  total_amount DECIMAL(12, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS supplier_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES supplier_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price_at_time DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_supplier_orders_supplier ON supplier_orders(supplier_id);
CREATE INDEX idx_supplier_orders_clinic ON supplier_orders(clinic_id);

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_order_items ENABLE ROW LEVEL SECURITY;

-- Product Policies
CREATE POLICY "Suppliers can manage their products"
  ON products FOR ALL
  USING (supplier_id = auth.uid());

CREATE POLICY "Everyone can view active products"
  ON products FOR SELECT
  USING (is_active = true OR supplier_id = auth.uid());

-- Order Policies
CREATE POLICY "Suppliers can view and update their orders"
  ON supplier_orders FOR ALL
  USING (supplier_id = auth.uid());

CREATE POLICY "Clinics can view their own orders"
  ON supplier_orders FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id FROM staff WHERE user_id = auth.uid()
    )
    OR
    clinic_id IN (
        SELECT id FROM clinics WHERE owner_id = auth.uid()
    )
  );
  
CREATE POLICY "Clinics can create orders"
  ON supplier_orders FOR INSERT
  WITH CHECK (
     clinic_id IN (
      SELECT clinic_id FROM staff WHERE user_id = auth.uid()
    )
    OR
    clinic_id IN (
        SELECT id FROM clinics WHERE owner_id = auth.uid()
    )
  );

-- Order Item Policies
CREATE POLICY "Access to order items based on order access"
  ON supplier_order_items FOR ALL
  USING (
    order_id IN (SELECT id FROM supplier_orders) -- Simplified, ideally stricter join
  );
