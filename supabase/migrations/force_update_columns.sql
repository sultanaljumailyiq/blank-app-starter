
ALTER TABLE treatments ADD COLUMN base_price numeric DEFAULT 0;
ALTER TABLE treatments ADD COLUMN default_phases jsonb DEFAULT '[]'::jsonb;
