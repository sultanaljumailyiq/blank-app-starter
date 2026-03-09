
-- 1. Enhance Treatments Table
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS base_price numeric DEFAULT 0;
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS cost_estimate numeric DEFAULT 0;
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS profit_margin numeric DEFAULT 0;
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS popularity integer DEFAULT 0;
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS expected_sessions integer DEFAULT 1;
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS is_complex boolean DEFAULT false;
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS default_phases jsonb DEFAULT '[]'::jsonb;
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS category text;

-- 2. Enhance Inventory Table
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS min_quantity integer DEFAULT 0;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS price numeric DEFAULT 0;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS expiry_date date;
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS category text;
-- Rename 'last_restocked' to standard if needed, or keep as is.

-- 3. Create System Templates Tables
CREATE TABLE IF NOT EXISTS system_treatment_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category text NOT NULL,
    base_price numeric DEFAULT 0,
    cost_estimate numeric DEFAULT 0,
    profit_margin numeric DEFAULT 0,
    popularity integer DEFAULT 0,
    expected_sessions integer DEFAULT 1,
    is_complex boolean DEFAULT false,
    default_phases jsonb DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS system_inventory_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category text NOT NULL,
    min_quantity integer DEFAULT 5,
    unit text NOT NULL,
    price numeric DEFAULT 0
);

-- 4. Enable RLS on Templates (Read-only for users, Full for Admin/System)
ALTER TABLE system_treatment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_inventory_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read of templates" ON system_treatment_templates;
CREATE POLICY "Allow public read of templates" ON system_treatment_templates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read of inventory templates" ON system_inventory_templates;
CREATE POLICY "Allow public read of inventory templates" ON system_inventory_templates FOR SELECT USING (true);
