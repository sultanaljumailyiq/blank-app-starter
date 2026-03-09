-- Create Follows Table for Directional Relationships
CREATE TABLE IF NOT EXISTS follows (
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id)
);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Anyone can read follows (to count followers/following)
CREATE POLICY "Anyone can read follows" ON follows FOR SELECT USING (true);

-- 2. Authenticated users can follow others (insert)
CREATE POLICY "Users can follow others" ON follows FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

-- 3. Users can unfollow (delete their own follow record)
CREATE POLICY "Users can unfollow" ON follows FOR DELETE
USING (auth.uid() = follower_id);
