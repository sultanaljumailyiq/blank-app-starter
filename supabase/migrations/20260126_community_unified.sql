-- 1. Ensure community_posts has images array
ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 2. Create community_likes table
CREATE TABLE IF NOT EXISTS community_likes (
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);

-- 3. Create community_comments table
CREATE TABLE IF NOT EXISTS community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

-- 5. Policies for Likes
CREATE POLICY "Public read likes" ON community_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated insert likes" ON community_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated delete likes" ON community_likes FOR DELETE USING (auth.uid() = user_id);

-- 6. Policies for Comments
CREATE POLICY "Public read comments" ON community_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated insert comments" ON community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON community_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON community_comments FOR DELETE USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM community_posts WHERE id = community_comments.post_id AND author_id = auth.uid()
));

-- 7. Add comments_count and likes_count functions or triggers (optional but good for perf)
-- For now we will count in query or use a view if needed, but client-side count is okay for small scale.
-- Let's create a helper RPC to get posts with counts if performance is needed later.

-- Helper to migrate old image_url to images array if needed
UPDATE community_posts 
SET images = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND (images IS NULL OR images = ARRAY[]::TEXT[]);
