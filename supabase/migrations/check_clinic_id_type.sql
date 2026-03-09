SELECT 
    table_name, 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    column_name = 'clinic_id' 
    AND table_name IN ('appointments', 'patients', 'staff', 'inventory_items', 'lab_orders', 'financial_transactions');
