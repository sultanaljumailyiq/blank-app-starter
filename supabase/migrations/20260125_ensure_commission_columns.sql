-- Ensure commission_percentage exists on dental_laboratories
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'dental_laboratories'
        AND column_name = 'commission_percentage'
    ) THEN
        ALTER TABLE dental_laboratories ADD COLUMN commission_percentage NUMERIC DEFAULT 5.0;
    END IF;
END $$;

-- Ensure commission_percentage exists on suppliers
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'suppliers'
        AND column_name = 'commission_percentage'
    ) THEN
        ALTER TABLE suppliers ADD COLUMN commission_percentage NUMERIC DEFAULT 5.0;
    END IF;
END $$;
