-- Check for missing tables: likes, group_members, reports
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('likes', 'group_members', 'reports');
