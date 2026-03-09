-- Drop existing policies if any to avoid conflicts (or just create if not exists, but for RLS usually better to replace)
DROP POLICY IF EXISTS "Users can view their own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can insert their own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can delete their own friendships" ON friendships;

-- Enable RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- 1. View Policy: Users can see rows where they are either user_id_1 or user_id_2
CREATE POLICY "Users can view their own friendships"
ON friendships FOR SELECT
USING (
  auth.uid() = user_id_1 OR auth.uid() = user_id_2
);

-- 2. Insert Policy: Users can insert if they are user_id_1 (initiator)
CREATE POLICY "Users can insert their own friendships"
ON friendships FOR INSERT
WITH CHECK (
  auth.uid() = user_id_1
);

-- 3. Delete Policy: Users can delete if they are user_id_1 or user_id_2
CREATE POLICY "Users can delete their own friendships"
ON friendships FOR DELETE
USING (
  auth.uid() = user_id_1 OR auth.uid() = user_id_2
);
