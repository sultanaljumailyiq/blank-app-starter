ALTER TABLE lab_services ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE lab_services ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
