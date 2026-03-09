SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('products', 'suppliers', 'brands', 'store_orders', 'coupons', 'promotions', 'clinic_staff', 'courses');

SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('products', 'suppliers', 'brands');
