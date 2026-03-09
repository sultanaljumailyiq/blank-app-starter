-- Check social tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('posts', 'likes', 'comments', 'post_images', 'social_interactions');

-- Check columns of existing tables if any
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('posts', 'likes', 'comments', 'articles');
