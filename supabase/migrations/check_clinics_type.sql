-- Check clinics table primary key type
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'clinics' AND column_name = 'id';
