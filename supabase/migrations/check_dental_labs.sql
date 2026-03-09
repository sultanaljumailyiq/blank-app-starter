-- Check structure of dental_laboratories to ensure compatibility
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dental_laboratories';
