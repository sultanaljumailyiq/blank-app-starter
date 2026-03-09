-- 1. Fix Groups Table Schema
ALTER TABLE groups ADD COLUMN IF NOT EXISTS category TEXT;

-- 2. Fix Posts RLS Policies
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert posts (ensure user_id matches)
DROP POLICY IF EXISTS "Users can insert own posts" ON posts;
CREATE POLICY "Users can insert own posts" ON posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow everyone to read posts
DROP POLICY IF EXISTS "Read access for everyone" ON posts;
CREATE POLICY "Read access for everyone" ON posts FOR SELECT USING (true);

-- Allow users to update their own posts
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE
USING (auth.uid() = user_id);

-- Allow users to delete their own posts
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE
USING (auth.uid() = user_id);


-- 3. Fix Friendships RLS Policies
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Allow users to send friend requests
DROP POLICY IF EXISTS "Users can insert friendship requests" ON friendships;
CREATE POLICY "Users can insert friendship requests" ON friendships FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their friendships (either sender or receiver)
DROP POLICY IF EXISTS "Users can view own friendships" ON friendships;
CREATE POLICY "Users can view own friendships" ON friendships FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Allow users to update friendship status (e.g. accept)
DROP POLICY IF EXISTS "Users can update own friendships" ON friendships;
CREATE POLICY "Users can update own friendships" ON friendships FOR UPDATE
USING (auth.uid() = friend_id OR auth.uid() = user_id);

-- Allow users to delete friendships (unfriend)
DROP POLICY IF EXISTS "Users can delete own friendships" ON friendships;
CREATE POLICY "Users can delete own friendships" ON friendships FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 4. Fix Groups RLS Policies
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can create groups" ON groups;
CREATE POLICY "Authenticated users can create groups" ON groups FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Everyone can view groups" ON groups;
CREATE POLICY "Everyone can view groups" ON groups FOR SELECT USING (true);

-- 5. Fix Group Members RLS
CREATE TABLE IF NOT EXISTS group_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', 
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View group members" ON group_members;
CREATE POLICY "View group members" ON group_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Join groups" ON group_members;
CREATE POLICY "Join groups" ON group_members FOR INSERT 
WITH CHECK (auth.uid() = user_id);

