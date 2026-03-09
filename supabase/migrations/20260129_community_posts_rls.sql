-- Enable RLS
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to delete their own posts
CREATE POLICY "Users can delete their own posts" 
ON community_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Policy: Allow users to update their own posts
CREATE POLICY "Users can update their own posts" 
ON community_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Everyone can view posts (assuming public community)
CREATE POLICY "Everyone can view posts" 
ON community_posts 
FOR SELECT 
USING (true);

-- Policy: Authenticated users can insert posts
CREATE POLICY "Authenticated users can insert posts" 
ON community_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
