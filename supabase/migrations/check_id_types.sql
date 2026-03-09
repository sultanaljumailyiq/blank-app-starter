SELECT 
    table_name, 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    (table_name = 'clinics' AND column_name = 'id') OR
    (table_name = 'financial_transactions' AND column_name = 'clinic_id') OR
    (table_name = 'appointments' AND column_name = 'clinic_id');
