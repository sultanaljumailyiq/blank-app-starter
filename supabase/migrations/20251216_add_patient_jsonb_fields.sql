-- Add JSONB columns for flexible clinical data storage
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS teeth_condition JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS treatment_plans JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS medical_history_data JSONB DEFAULT '{}'::jsonb;

-- Comment on columns for clarity
COMMENT ON COLUMN patients.teeth_condition IS 'Stores current state of teeth (e.g., decay, missing) as JSON array';
COMMENT ON COLUMN patients.treatment_plans IS 'Stores array of active/completed treatment plans';
COMMENT ON COLUMN patients.medical_history_data IS 'Stores structured VITALS, CONDITIONS, ALLERGIES, etc.';
