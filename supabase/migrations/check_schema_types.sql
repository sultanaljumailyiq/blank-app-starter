
SELECT table_name, data_type 
FROM information_schema.columns 
WHERE column_name = 'id' 
AND table_name IN ('treatments', 'dental_laboratories', 'patients', 'profiles', 'clinics', 'staff');
