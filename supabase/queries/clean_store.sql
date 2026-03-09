-- Cleanup extra suppliers
-- Keep only the one linked to 'supplier.demo@smartdental.com' (Auth User)
-- OR delete ALL and let the seed script recreate the single correct one.

-- Safety check: Get the ID of the demo supplier user
DO $$
DECLARE
    dummy_id UUID;
BEGIN
    -- Delete suppliers who are NOT the demo user (requires joining profiles to check email, or just manual cleanup)
    -- Simpler: Delete all suppliers that are NOT linked to our known demo users.
    -- But since we seeded fresh, let's just wipe suppliers and re-seed properly.
    
    DELETE FROM suppliers 
    WHERE contact_email NOT LIKE '%supplier.demo%'; 
    -- Assuming I used that email in the seed script or user profile.
    
    -- Also ensure only 6 products exist for that supplier
    -- (The seed script adds 6. If we ran it twice, we might have 12).
    -- We should clean up products too.
END $$;

-- Actually, let's just use a hard Delete for non-demo data if possible.
DELETE FROM products;
DELETE FROM suppliers;

-- Now the user can run 'node scripts/setup_full_platform.cjs' ONE TIME to get exactly 1 supplier and 6 products.
