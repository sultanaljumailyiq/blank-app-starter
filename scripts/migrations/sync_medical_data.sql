-- Migration to synchronize medical history data
-- This script moves legacy `medical_history` (text) into `medical_history_data` (JSONB) and `allergies` (Array)
-- It ensures that data entered in the old system is visible in the new "Medical Alerts" section.

-- 1. Populate medical_history_data.allergies from medical_history text if allergies is empty
UPDATE patients
SET medical_history_data = jsonb_set(
    COALESCE(medical_history_data, '{}'::jsonb),
    '{allergies}',
    to_jsonb(string_to_array(medical_history, ','))
)
WHERE medical_history IS NOT NULL 
  AND medical_history <> ''
  AND (medical_history_data->'allergies' IS NULL OR jsonb_array_length(medical_history_data->'allergies') = 0);

-- 2. Sync allergies column (ARRAY) from medical_history_data
UPDATE patients
SET allergies = ARRAY(SELECT jsonb_array_elements_text(medical_history_data->'allergies'))
WHERE medical_history_data->'allergies' IS NOT NULL;

-- 3. Ensure medical_history (text) is synced back from data (optional, but keeps legacy view consistent)
-- (Skipping this for now to avoid overwriting legacy data with potentially partial new data, unless requested)
