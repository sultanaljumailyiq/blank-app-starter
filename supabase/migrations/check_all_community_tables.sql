-- Check all community-related tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'posts', 
    'comments', 
    'likes',
    'groups', 
    'group_members', 
    'group_requests',
    'friendships',
    'notifications',
    'enrollments',
    'saved_items',
    'courses',
    'models',
    'model_sources',
    'scientific_resources',
    'reports',
    'direct_messages'
)
ORDER BY table_name;
