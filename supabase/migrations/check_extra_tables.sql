SELECT 
    table_name, 
    column_name 
FROM 
    information_schema.columns 
WHERE 
    table_name IN ('treatments', 'lab_orders', 'lab_requests') AND column_name = 'doctor_id';
