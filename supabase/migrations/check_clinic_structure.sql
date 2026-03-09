-- Check clinics table structure for settings columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clinics';

-- Check if activity_logs exists
SELECT 'activity_logs' as table_name, EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_logs') as exists;

-- Check clinic_branches structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clinic_branches';
