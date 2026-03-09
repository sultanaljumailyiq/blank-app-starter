
DROP TABLE IF EXISTS system_treatment_templates;
DROP TABLE IF EXISTS system_inventory_templates;

CREATE TABLE system_treatment_templates (
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

CREATE TABLE system_inventory_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category text NOT NULL,
    min_quantity integer DEFAULT 5,
    unit text NOT NULL,
    price numeric DEFAULT 0
);

ALTER TABLE system_treatment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_inventory_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of templates" ON system_treatment_templates FOR SELECT USING (true);
CREATE POLICY "Allow public read of inventory templates" ON system_inventory_templates FOR SELECT USING (true);
