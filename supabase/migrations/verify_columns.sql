-- Verify new columns in courses and profiles
SELECT 'courses.type' as column_check, COUNT(*) as exists FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'type'
UNION ALL
SELECT 'courses.category', COUNT(*) FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'category'
UNION ALL
SELECT 'profiles.is_elite', COUNT(*) FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_elite'
UNION ALL
SELECT 'profiles.is_syndicate', COUNT(*) FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_syndicate';
