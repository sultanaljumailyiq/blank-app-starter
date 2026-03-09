-- 1. Delete all clinics EXCEPT 101 and 102
-- Note: This assumes ON DELETE CASCADE is set for foreign keys. 
-- If not, we'd need to delete from child tables (appointments, patients, etc.) first.
DELETE FROM clinics 
WHERE id NOT IN (101, 102);

-- 2. Upsert Clinic 101 (Al Noor)
INSERT INTO clinics (id, name, address, phone, email, type, status)
VALUES (
    101, 
    'عيادة النور التخصصية', 
    'بغداد - المنصور', 
    '07701234567', 
    'info@alnoor.com', 
    'dental',
    'active'
)
ON CONFLICT (id) DO UPDATE 
SET 
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    status = 'active';

-- 3. Upsert Clinic 102 (Smile Center)
INSERT INTO clinics (id, name, address, phone, email, type, status)
VALUES (
    102, 
    'مركز الابتسامة الرقمي', 
    'البصرة - الجزائر', 
    '07801234567', 
    'info@smilecenter.com', 
    'dental',
    'active'
)
ON CONFLICT (id) DO UPDATE 
SET 
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    status = 'active';

-- 4. Ensure current user is the owner (Optional: Logic usually handled in app, but good for demo)
-- UPDATE clinics SET owner_id = auth.uid() WHERE id IN (101, 102); 
-- (Commented out as auth.uid() is not available in simple SQL script execution context usually)
