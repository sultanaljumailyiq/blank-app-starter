-- COMPREHENSIVE VERIFICATION: Check all tables and key columns exist

-- Community Tables
SELECT 'posts' as table_check, EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts' AND table_schema = 'public') as exists
UNION ALL SELECT 'comments', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments' AND table_schema = 'public')
UNION ALL SELECT 'likes', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'likes' AND table_schema = 'public')
UNION ALL SELECT 'groups', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'groups' AND table_schema = 'public')
UNION ALL SELECT 'group_members', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_members' AND table_schema = 'public')
UNION ALL SELECT 'group_requests', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_requests' AND table_schema = 'public')
UNION ALL SELECT 'friendships', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'friendships' AND table_schema = 'public')
UNION ALL SELECT 'notifications', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public')
UNION ALL SELECT 'reports', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports' AND table_schema = 'public')

-- Courses/Events
UNION ALL SELECT 'courses', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'courses' AND table_schema = 'public')
UNION ALL SELECT 'enrollments', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'enrollments' AND table_schema = 'public')

-- Resources
UNION ALL SELECT 'scientific_resources', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scientific_resources' AND table_schema = 'public')
UNION ALL SELECT 'models', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'models' AND table_schema = 'public')
UNION ALL SELECT 'model_sources', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'model_sources' AND table_schema = 'public')
UNION ALL SELECT 'saved_items', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'saved_items' AND table_schema = 'public')

-- Profiles
UNION ALL SELECT 'profiles', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public')

-- Direct Messages
UNION ALL SELECT 'direct_messages', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'direct_messages' AND table_schema = 'public')
UNION ALL SELECT 'conversations', EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations' AND table_schema = 'public')

-- Storage Buckets
UNION ALL SELECT 'bucket:avatars', EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars')
UNION ALL SELECT 'bucket:community-posts', EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'community-posts')

ORDER BY table_check;
