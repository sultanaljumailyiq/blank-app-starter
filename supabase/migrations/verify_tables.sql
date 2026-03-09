-- Verify all new tables and columns were created
SELECT 'likes' as table_name, COUNT(*) as exists FROM information_schema.tables WHERE table_name = 'likes' AND table_schema = 'public'
UNION ALL
SELECT 'group_members', COUNT(*) FROM information_schema.tables WHERE table_name = 'group_members' AND table_schema = 'public'
UNION ALL
SELECT 'reports', COUNT(*) FROM information_schema.tables WHERE table_name = 'reports' AND table_schema = 'public';
