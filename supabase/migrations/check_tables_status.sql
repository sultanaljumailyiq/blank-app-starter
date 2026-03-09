
SELECT 
    t.table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t.table_name) THEN 'EXISTS' ELSE 'MISSING' END as status
FROM (VALUES ('patients'), ('patient_teeth'), ('tooth_treatment_plans'), ('treatment_sessions')) as t(table_name);
