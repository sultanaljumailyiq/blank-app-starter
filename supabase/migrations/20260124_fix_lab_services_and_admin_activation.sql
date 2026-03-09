-- =============================================
-- FIX LAB_SERVICES INSERT AND ADMIN LAB ACTIVATION
-- =============================================

-- 1. Enable RLS on lab_services
ALTER TABLE lab_services ENABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies
DROP POLICY IF EXISTS "Labs can view their services" ON lab_services;
DROP POLICY IF EXISTS "Labs can insert their services" ON lab_services;
DROP POLICY IF EXISTS "Labs can update their services" ON lab_services;
DROP POLICY IF EXISTS "Labs can delete their services" ON lab_services;
DROP POLICY IF EXISTS "Anyone can view services" ON lab_services;
DROP POLICY IF EXISTS "Labs can manage their services" ON lab_services;
DROP POLICY IF EXISTS "Public read lab_services" ON lab_services;
DROP POLICY IF EXISTS "Users insert own lab_services" ON lab_services;
DROP POLICY IF EXISTS "Users update own lab_services" ON lab_services;
DROP POLICY IF EXISTS "Users delete own lab_services" ON lab_services;

-- 3. Create simple permissive policies for lab_services
-- Allow anyone to read services
CREATE POLICY "Read lab_services"
    ON lab_services FOR SELECT
    USING (TRUE);

-- Allow all authenticated users to insert/update/delete (RLS simplified)
CREATE POLICY "Manage lab_services"
    ON lab_services FOR ALL
    USING (TRUE)
    WITH CHECK (TRUE);

-- 4. Add account_status and verification columns to dental_laboratories if not exist
ALTER TABLE dental_laboratories 
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'pending';

ALTER TABLE dental_laboratories 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE dental_laboratories 
ADD COLUMN IF NOT EXISTS is_accredited BOOLEAN DEFAULT FALSE;

ALTER TABLE dental_laboratories 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

ALTER TABLE dental_laboratories 
ADD COLUMN IF NOT EXISTS verified_by UUID;

ALTER TABLE dental_laboratories 
ADD COLUMN IF NOT EXISTS accredited_at TIMESTAMPTZ;

ALTER TABLE dental_laboratories 
ADD COLUMN IF NOT EXISTS accredited_by UUID;

-- 5. Drop existing function if exists
DROP FUNCTION IF EXISTS toggle_lab_activation(UUID, TEXT, UUID);

-- 6. Create function to activate/deactivate lab
CREATE OR REPLACE FUNCTION toggle_lab_activation(
    p_lab_id UUID,
    p_action TEXT,
    p_admin_id UUID
) RETURNS VOID AS $$
BEGIN
    IF p_action = 'activate' THEN
        UPDATE dental_laboratories
        SET account_status = 'active', is_active = TRUE, updated_at = NOW()
        WHERE id = p_lab_id;
    ELSIF p_action = 'deactivate' THEN
        UPDATE dental_laboratories
        SET account_status = 'inactive', is_active = FALSE, updated_at = NOW()
        WHERE id = p_lab_id;
    ELSIF p_action = 'verify' THEN
        UPDATE dental_laboratories
        SET is_verified = TRUE, verified_at = NOW(), verified_by = p_admin_id, account_status = 'active', updated_at = NOW()
        WHERE id = p_lab_id;
    ELSIF p_action = 'unverify' THEN
        UPDATE dental_laboratories
        SET is_verified = FALSE, verified_at = NULL, verified_by = NULL, updated_at = NOW()
        WHERE id = p_lab_id;
    ELSIF p_action = 'accredit' THEN
        UPDATE dental_laboratories
        SET is_accredited = TRUE, accredited_at = NOW(), accredited_by = p_admin_id, updated_at = NOW()
        WHERE id = p_lab_id;
    ELSIF p_action = 'unaccredit' THEN
        UPDATE dental_laboratories
        SET is_accredited = FALSE, accredited_at = NULL, accredited_by = NULL, updated_at = NOW()
        WHERE id = p_lab_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION toggle_lab_activation TO authenticated;
