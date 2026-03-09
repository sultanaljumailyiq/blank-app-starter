-- Add missing columns to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS start_time TEXT,
ADD COLUMN IF NOT EXISTS end_time TEXT,
ADD COLUMN IF NOT EXISTS type TEXT;

-- Ensure status column exists and has correct type (text is flexible, enum is strict)
-- We will use TEXT for flexibility as per previous schema discussions
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';
