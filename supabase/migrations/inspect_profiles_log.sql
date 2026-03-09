-- Inspect 'profiles' table columns with logging
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Column: % | Type: % | Nullable: % | Default: %', r.column_name, r.data_type, r.is_nullable, r.column_default;
    END LOOP;
END $$;
