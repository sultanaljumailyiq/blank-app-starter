-- Add 'type' column to appointments if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'type') THEN
        ALTER TABLE appointments ADD COLUMN type TEXT DEFAULT 'كشف';
    END IF;
END $$;

-- Reload schema cache (optional, sometimes helps)
NOTIFY pgrst, 'reload config';
