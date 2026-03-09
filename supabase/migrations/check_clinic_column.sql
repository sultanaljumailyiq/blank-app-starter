
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'treatments' AND column_name LIKE '%clinic%';
