
SELECT name, default_phases, clinic_id 
FROM treatments 
WHERE name LIKE '%علاج عصب%' OR name LIKE '%زركون%'
LIMIT 5;
