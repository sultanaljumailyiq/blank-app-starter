ALTER TABLE ai_analyses 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'completed';

-- Verify it was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ai_analyses';
