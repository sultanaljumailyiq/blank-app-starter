-- ==============================================================================
-- COMPLETE COMMUNITY SCHEMA MIGRATION
-- ==============================================================================

-- ============================================
-- 1. CREATE MISSING TABLES
-- ============================================

-- 1.1 Likes Table
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read likes" ON likes;
CREATE POLICY "Public read likes" ON likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage own likes" ON likes;
CREATE POLICY "Users manage own likes" ON likes FOR ALL USING (auth.uid() = user_id);

-- 1.2 Group Members Table
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read group members" ON group_members;
CREATE POLICY "Public read group members" ON group_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users join groups" ON group_members;
CREATE POLICY "Users join groups" ON group_members FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage members" ON group_members;
CREATE POLICY "Admins manage members" ON group_members FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM group_members gm 
        WHERE gm.group_id = group_members.group_id 
        AND gm.user_id = auth.uid() 
        AND gm.role IN ('admin', 'moderator')
    )
);

DROP POLICY IF EXISTS "Users leave groups" ON group_members;
CREATE POLICY "Users leave groups" ON group_members FOR DELETE USING (auth.uid() = user_id);

-- 1.3 Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    target_id UUID NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment', 'user', 'group')),
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users create reports" ON reports;
CREATE POLICY "Users create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Admins view reports" ON reports;
CREATE POLICY "Admins view reports" ON reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- 2. ADD MISSING COLUMNS TO COURSES TABLE
-- ============================================
-- To differentiate between courses and webinars

ALTER TABLE courses ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'دورة';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'course' CHECK (type IN ('course', 'webinar', 'workshop'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS date TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Online';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'مبتدئ' CHECK (level IN ('مبتدئ', 'متوسط', 'متقدم'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 5.0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS students INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS syllabus JSONB DEFAULT '[]';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS meeting_url TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT true;

-- ============================================
-- 3. ADD MISSING COLUMNS TO PROFILES TABLE
-- ============================================
-- For Elite and Syndicate promotion

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_elite BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_syndicate BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialty TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hospital TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT false;

-- ============================================
-- 4. ADD MISSING COLUMNS TO GROUPS TABLE
-- ============================================

ALTER TABLE groups ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS privacy TEXT DEFAULT 'public' CHECK (privacy IN ('public', 'private'));
ALTER TABLE groups ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0;

-- ============================================
-- 5. ADD MISSING COLUMNS TO POSTS TABLE
-- ============================================

ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_elite BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_syndicate BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS category TEXT;

-- ============================================
-- 6. ENABLE RLS ON ALL COMMUNITY TABLES
-- ============================================

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read courses" ON courses;
CREATE POLICY "Public read courses" ON courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage courses" ON courses;
CREATE POLICY "Admins manage courses" ON courses FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- SUCCESS
-- ============================================
SELECT 'Community schema migration completed successfully!' as status;
