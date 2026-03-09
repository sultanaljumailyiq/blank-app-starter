-- 1. Identify valid lab ID (The one that corresponds to Al-Adwaa/Advanced)
-- We will rename the first available lab to 'مختبر الأضواء للأسنان' to be the canonical one.
UPDATE dental_laboratories
SET lab_name = 'مختبر الأضواء للأسنان',
    account_status = 'active',
    is_verified = true
WHERE id = (
    SELECT id FROM dental_laboratories 
    ORDER BY created_at DESC 
    LIMIT 1
);

-- 2. Move ALL existing orders to this canonical Lab
UPDATE dental_lab_orders
SET laboratory_id = (
    SELECT id FROM dental_laboratories 
    WHERE lab_name = 'مختبر الأضواء للأسنان'
    LIMIT 1
);

-- 3. Delete any OTHER labs to prevent confusion (as requested: "One Lab Only")
DELETE FROM dental_laboratories 
WHERE lab_name != 'مختبر الأضواء للأسنان';

-- 4. Ensure dental_lab_orders doesn't have NULL laboratory_id anymore (if they were Manual)
-- We just did this in step 2 (it updates ALL rows).
