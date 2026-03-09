-- COMPREHENSIVE COMMUNITY VERIFICATION
-- Check all community tables and their key columns

SELECT 'TABLES CHECK' as section;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'posts', 'comments', 'likes', 'groups', 'group_members', 'group_requests',
    'friendships', 'notifications', 'enrollments', 'saved_items', 'courses', 
    'models', 'model_sources', 'scientific_resources', 'reports', 'profiles'
)
ORDER BY table_name;
