-- Update order #ord-2 to be a Manual Lab (Private City Lab) order
UPDATE dental_lab_orders
SET 
    laboratory_id = NULL,
    custom_lab_name = 'مختبر المدينة الخاص'
WHERE 
    id = 'ord-2' OR order_number = 'ord-2';
