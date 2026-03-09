SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_name IN ('friendships', 'group_members');
