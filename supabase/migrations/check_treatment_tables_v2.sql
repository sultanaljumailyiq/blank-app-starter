
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_name IN ('patients', 'patient_teeth', 'tooth_treatment_plans', 'treatment_sessions')
ORDER BY table_name, column_name;
