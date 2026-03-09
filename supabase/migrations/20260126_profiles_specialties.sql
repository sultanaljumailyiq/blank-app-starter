-- Add specialties column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS university TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS graduation_year INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;

-- Verify
SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' AND column_name IN ('specialties', 'university', 'graduation_year', 'address');
