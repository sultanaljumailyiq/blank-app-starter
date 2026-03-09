
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_name IN ('patients', 'treatment_plans', 'patient_treatments')
ORDER BY table_name, column_name;
