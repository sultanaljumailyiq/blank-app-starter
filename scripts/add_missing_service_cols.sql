ALTER TABLE lab_services ADD COLUMN IF NOT EXISTS category text DEFAULT 'عام';
ALTER TABLE lab_services ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE lab_services ADD COLUMN IF NOT EXISTS estimated_time text;
