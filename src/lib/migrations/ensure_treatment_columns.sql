-- Ensure 'scope' column exists
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS scope text CHECK (scope IN ('tooth', 'general', 'both')) DEFAULT 'tooth';

-- Ensure 'is_active' column exists
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Ensure 'expected_sessions' column exists
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS expected_sessions integer DEFAULT 1;

-- Ensure 'is_complex' column exists
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS is_complex boolean DEFAULT false;

-- Update existing records to have valid defaults if null
UPDATE treatments SET is_active = true WHERE is_active IS NULL;
UPDATE treatments SET expected_sessions = 1 WHERE expected_sessions IS NULL;
UPDATE treatments SET is_complex = false WHERE is_complex IS NULL;
UPDATE treatments SET scope = 'tooth' WHERE scope IS NULL;
