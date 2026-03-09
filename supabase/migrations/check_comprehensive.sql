-- Check all tables used by both CommunityContext and useAdminCommunity
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    -- CommunityContext uses:
    'posts', 'comments', 'likes', 'groups', 'group_members', 'group_requests',
    'friendships', 'notifications', 'enrollments', 'saved_items', 'courses', 
    'models', 'model_sources', 'scientific_resources', 'reports',
    -- useAdminCommunity uses:
    'webinars', 'medical_groups', 'resources', 'profiles'
)
ORDER BY table_name;
