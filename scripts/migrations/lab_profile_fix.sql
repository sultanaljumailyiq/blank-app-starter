-- Lab Profile Full Fix Migration
-- Adds governorate column, RLS UPDATE/INSERT policies, and migrates existing data

-- 1. Add governorate column to dental_laboratories
ALTER TABLE dental_laboratories ADD COLUMN IF NOT EXISTS governorate text;

-- 2. Add governorate column to profiles  
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS governorate text;

-- 3. Migrate existing combined address data: "Governorate - Street" → split into two columns
UPDATE dental_laboratories
SET
    governorate = TRIM(SPLIT_PART(address, ' - ', 1)),
    address = TRIM(SUBSTRING(address FROM POSITION(' - ' IN address) + 3))
WHERE address LIKE '% - %';

-- 4. Drop old policies if they exist (idempotent)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Lab owner can update their lab" ON dental_laboratories;
    DROP POLICY IF EXISTS "Lab owner can insert their lab" ON dental_laboratories;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 5. Create UPDATE RLS policy: lab owner can update only their own row
CREATE POLICY "Lab owner can update their lab"
ON dental_laboratories
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Create INSERT RLS policy: lab owner can insert their own row
CREATE POLICY "Lab owner can insert their lab"
ON dental_laboratories
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 7. Sync profiles.full_name from dental_laboratories.name (fixes naming inconsistency)
UPDATE profiles p
SET full_name = dl.name
FROM dental_laboratories dl
WHERE dl.user_id = p.id
  AND dl.name IS NOT NULL
  AND dl.name != ''
  AND (p.full_name IS NULL OR p.full_name != dl.name);
