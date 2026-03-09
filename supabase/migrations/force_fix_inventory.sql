
ALTER TABLE inventory ADD COLUMN clinic_id uuid REFERENCES clinics(id) ON DELETE CASCADE;
ALTER TABLE inventory ADD COLUMN name text;
ALTER TABLE inventory ADD COLUMN quantity integer DEFAULT 0;
