-- Add priority column to appointments if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'priority') THEN
        ALTER TABLE appointments ADD COLUMN priority TEXT DEFAULT 'normal';
    END IF;

    -- Add type column if missing (safety check)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'type') THEN
        ALTER TABLE appointments ADD COLUMN type TEXT DEFAULT 'consultation';
    END IF;
END $$;
