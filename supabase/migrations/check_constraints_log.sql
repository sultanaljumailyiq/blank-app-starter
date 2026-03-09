-- Check constraints for financial_transactions and LOG output
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT 
            tc.constraint_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.table_name = 'financial_transactions' AND tc.constraint_type = 'FOREIGN KEY'
    LOOP
        RAISE NOTICE 'Constraint: % | Column: % | RefTable: %', r.constraint_name, r.column_name, r.foreign_table_name;
    END LOOP;
END $$;
