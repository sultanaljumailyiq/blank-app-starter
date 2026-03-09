
-- Update products to belong to the correct demo supplier
-- The demo supplier ID is 'c83cf236-1175-4181-8222-d60ca2f9327d' (from previous query)
-- The seeded products had 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

UPDATE products
SET supplier_id = 'c83cf236-1175-4181-8222-d60ca2f9327d'
WHERE supplier_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' OR supplier_id IS NULL;

-- Also update brands if needed
UPDATE brands
SET supplier_id = 'c83cf236-1175-4181-8222-d60ca2f9327d'
WHERE supplier_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' OR supplier_id IS NULL;
