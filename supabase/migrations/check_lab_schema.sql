SELECT 
    table_name, 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name IN ('lab_orders', 'lab_requests') AND column_name IN ('doctor_id', 'dentist_id', 'staff_id', 'created_by');
