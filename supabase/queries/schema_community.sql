-- ==============================================================================
-- COMMUNITY SCHEMA (Fixed)
-- ==============================================================================

-- 1. Posts
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT,
    image_url TEXT,
    category TEXT,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read posts" ON community_posts;
CREATE POLICY "Public read posts" ON community_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users create posts" ON community_posts;
CREATE POLICY "Users create posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own posts" ON community_posts;
CREATE POLICY "Users update own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own posts" ON community_posts;
CREATE POLICY "Users delete own posts" ON community_posts FOR DELETE USING (auth.uid() = user_id);

-- 2. Comments
CREATE TABLE IF NOT EXISTS community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read comments" ON community_comments;
CREATE POLICY "Public read comments" ON community_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users create comments" ON community_comments;
CREATE POLICY "Users create comments" ON community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Likes
CREATE TABLE IF NOT EXISTS community_likes (
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (post_id, user_id)
);
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read likes" ON community_likes;
CREATE POLICY "Public read likes" ON community_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users toggle likes" ON community_likes;
CREATE POLICY "Users toggle likes" ON community_likes FOR ALL USING (auth.uid() = user_id);

-- 4. Groups
CREATE TABLE IF NOT EXISTS community_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    members_count INTEGER DEFAULT 0,
    is_private BOOLEAN DEFAULT false,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read groups" ON community_groups;
CREATE POLICY "Public read groups" ON community_groups FOR SELECT USING (true);

-- 5. Courses/Events
CREATE TABLE IF NOT EXISTS community_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    instructor_name TEXT,
    start_date TIMESTAMPTZ,
    price DECIMAL(10, 2) DEFAULT 0,
    is_online BOOLEAN DEFAULT true,
    meeting_url TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read events" ON community_events;
CREATE POLICY "Public read events" ON community_events FOR SELECT USING (true);

-- 6. Saved Items (Bookmarks)
CREATE TABLE IF NOT EXISTS community_saved_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL, 
    item_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE community_saved_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage saved" ON community_saved_items;
CREATE POLICY "Users manage saved" ON community_saved_items FOR ALL USING (auth.uid() = user_id);
