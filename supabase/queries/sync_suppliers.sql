-- Manual sync of user_id and profile_id for suppliers
-- Run this to ensure all suppliers have matching user_id and profile_id

-- Sync from profile_id to user_id
UPDATE suppliers 
SET user_id = profile_id 
WHERE user_id IS NULL AND profile_id IS NOT NULL;

-- Sync from user_id to profile_id
UPDATE suppliers 
SET profile_id = user_id 
WHERE profile_id IS NULL AND user_id IS NOT NULL;

-- Show current status
SELECT id, name, user_id, profile_id FROM suppliers;
