
-- Check Patients Table
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'patients';

-- Check Appointments Table
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'appointments';

-- Check Financial Transactions Table
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'financial_transactions';

-- Check if 'invoices' table exists and its columns
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'invoices';
