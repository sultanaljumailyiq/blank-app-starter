
DO $$ BEGIN
    ALTER TABLE treatments ADD COLUMN cost_estimate numeric DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'cost_estimate exists'; END $$;

DO $$ BEGIN
    ALTER TABLE treatments ADD COLUMN profit_margin numeric DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'profit_margin exists'; END $$;

DO $$ BEGIN
    ALTER TABLE treatments ADD COLUMN popularity integer DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'popularity exists'; END $$;

DO $$ BEGIN
    ALTER TABLE treatments ADD COLUMN expected_sessions integer DEFAULT 1;
EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'expected_sessions exists'; END $$;

DO $$ BEGIN
    ALTER TABLE treatments ADD COLUMN is_complex boolean DEFAULT false;
EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'is_complex exists'; END $$;
