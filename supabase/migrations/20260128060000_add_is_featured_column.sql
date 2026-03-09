-- Add is_featured column to clinics table if it excludes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clinics' AND column_name = 'is_featured') THEN
        ALTER TABLE clinics ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;
END $$;
