-- Add updated_at column to dental_laboratories if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'dental_laboratories'
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE dental_laboratories ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;
