-- =====================================================
-- Migration: Sync supplier email, phone, and logo
-- from profiles table to suppliers table
-- Date: 2026-02-26
-- =====================================================

-- Step 1: Sync email from profiles → suppliers (where suppliers.email is NULL or empty)
UPDATE suppliers s
SET email = p.email
FROM profiles p
WHERE
    (s.user_id = p.id OR s.profile_id = p.id)
    AND (s.email IS NULL OR s.email = '')
    AND p.email IS NOT NULL
    AND p.email <> '';

-- Step 2: Sync phone from profiles → suppliers (where suppliers.phone is NULL or empty)
UPDATE suppliers s
SET phone = p.phone
FROM profiles p
WHERE
    (s.user_id = p.id OR s.profile_id = p.id)
    AND (s.phone IS NULL OR s.phone = '')
    AND p.phone IS NOT NULL
    AND p.phone <> '';

-- Step 3: Sync logo from profiles.avatar_url → suppliers.logo (where suppliers.logo is NULL)
UPDATE suppliers s
SET logo = p.avatar_url
FROM profiles p
WHERE
    (s.user_id = p.id OR s.profile_id = p.id)
    AND (s.logo IS NULL OR s.logo = '')
    AND p.avatar_url IS NOT NULL
    AND p.avatar_url <> '';

-- Step 4: Also sync profiles.avatar_url from suppliers.logo
-- (so community profile image matches the supplier logo)
UPDATE profiles p
SET avatar_url = s.logo
FROM suppliers s
WHERE
    (s.user_id = p.id OR s.profile_id = p.id)
    AND (p.avatar_url IS NULL OR p.avatar_url = '')
    AND s.logo IS NOT NULL
    AND s.logo <> '';

-- Step 5: Verify results
DO $$
DECLARE
    null_email_count INT;
    null_phone_count INT;
    null_logo_count INT;
    synced_profiles INT;
BEGIN
    SELECT COUNT(*) INTO null_email_count FROM suppliers WHERE email IS NULL OR email = '';
    SELECT COUNT(*) INTO null_phone_count FROM suppliers WHERE phone IS NULL OR phone = '';
    SELECT COUNT(*) INTO null_logo_count FROM suppliers WHERE logo IS NULL OR logo = '';
    SELECT COUNT(*) INTO synced_profiles FROM suppliers WHERE email IS NOT NULL AND email <> '';

    RAISE NOTICE '=== Migration Sync Results ===';
    RAISE NOTICE 'Suppliers with synced email:   %', synced_profiles;
    RAISE NOTICE 'Suppliers with NULL email:     %', null_email_count;
    RAISE NOTICE 'Suppliers with NULL phone:     %', null_phone_count;
    RAISE NOTICE 'Suppliers with NULL logo:      %', null_logo_count;
    RAISE NOTICE '✅ Migration complete!';
END $$;
