
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'treatments' OR table_name = 'inventory';
