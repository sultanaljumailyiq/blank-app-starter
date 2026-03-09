
DO $$ BEGIN
    ALTER TABLE inventory ADD COLUMN category text;
EXCEPTION WHEN duplicate_column THEN
    RAISE NOTICE 'inventory.category already exists';
END $$;

DO $$ BEGIN
    ALTER TABLE treatments ADD COLUMN category text;
EXCEPTION WHEN duplicate_column THEN
    RAISE NOTICE 'treatments.category already exists';
END $$;
