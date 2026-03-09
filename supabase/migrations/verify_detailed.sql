-- Check specific columns in courses table
SELECT 
    'courses.type' as check_item,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'type') THEN 'YES' ELSE 'NO' END as exists
UNION ALL SELECT 'courses.category', CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'category') THEN 'YES' ELSE 'NO' END
UNION ALL SELECT 'courses.instructor', CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'instructor') THEN 'YES' ELSE 'NO' END
UNION ALL SELECT 'courses.date', CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'date') THEN 'YES' ELSE 'NO' END
UNION ALL SELECT 'courses.featured', CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'featured') THEN 'YES' ELSE 'NO' END
UNION ALL SELECT 'profiles.is_elite', CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_elite') THEN 'YES' ELSE 'NO' END
UNION ALL SELECT 'profiles.is_syndicate', CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_syndicate') THEN 'YES' ELSE 'NO' END
UNION ALL SELECT 'profiles.specialty', CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'specialty') THEN 'YES' ELSE 'NO' END
UNION ALL SELECT 'likes_table', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'likes' AND table_schema = 'public') THEN 'YES' ELSE 'NO' END
UNION ALL SELECT 'group_members_table', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_members' AND table_schema = 'public') THEN 'YES' ELSE 'NO' END
UNION ALL SELECT 'reports_table', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports' AND table_schema = 'public') THEN 'YES' ELSE 'NO' END
UNION ALL SELECT 'posts.image_url', CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'image_url') THEN 'YES' ELSE 'NO' END
UNION ALL SELECT 'groups.is_verified', CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'groups' AND column_name = 'is_verified') THEN 'YES' ELSE 'NO' END;
