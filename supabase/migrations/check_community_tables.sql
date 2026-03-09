-- Check Posts Policies
SELECT * FROM pg_policies WHERE tablename = 'posts';

-- Check Groups Columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'groups';

-- Check Groups Policies
SELECT * FROM pg_policies WHERE tablename = 'groups';
