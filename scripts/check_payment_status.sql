SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'dental_lab_orders' 
AND column_name = 'payment_status';
