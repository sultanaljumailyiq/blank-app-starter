-- 1. Ensure 'images' column exists (Array of text)
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 2. Ensure 'is_public' column exists
ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- 3. Ensure RLS is enabled
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- 4. Re-apply INSERT policy to guarantee access
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON community_posts;
CREATE POLICY "Authenticated users can insert posts" 
ON community_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 5. Ensure UPDATE policy allows owners to edit
DROP POLICY IF EXISTS "Users can update their own posts" ON community_posts;
CREATE POLICY "Users can update their own posts" 
ON community_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 6. Ensure DELETE policy allows owners to delete
DROP POLICY IF EXISTS "Users can delete their own posts" ON community_posts;
CREATE POLICY "Users can delete their own posts" 
ON community_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- 7. Ensure SELECT policy is public
DROP POLICY IF EXISTS "Everyone can view posts" ON community_posts;
CREATE POLICY "Everyone can view posts" 
ON community_posts 
FOR SELECT 
USING (true);
