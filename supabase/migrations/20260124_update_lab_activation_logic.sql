-- =============================================
-- UPDATE TOGGLE_LAB_ACTIVATION RPC
-- =============================================

-- Drop existing function
DROP FUNCTION IF EXISTS toggle_lab_activation(UUID, TEXT, UUID);

-- Create updated function with new logic
CREATE OR REPLACE FUNCTION toggle_lab_activation(
    p_lab_id UUID,
    p_action TEXT,
    p_admin_id UUID
) RETURNS VOID AS $$
BEGIN
    IF p_action = 'activate' THEN
        -- Activate implies verifying as well
        UPDATE dental_laboratories
        SET 
            account_status = 'active', 
            is_active = TRUE, 
            is_verified = TRUE,
            verified_at = NOW(),
            verified_by = p_admin_id,
            updated_at = NOW()
        WHERE id = p_lab_id;
    ELSIF p_action = 'deactivate' THEN
        -- Deactivate implies returning to pending (or suspended, but user wants it in requests) and unverified
        UPDATE dental_laboratories
        SET 
            account_status = 'pending', -- Back to pending so it shows in requests
            is_active = FALSE, 
            is_verified = FALSE,
            verified_at = NULL,
            verified_by = NULL,
            updated_at = NOW()
        WHERE id = p_lab_id;
    ELSIF p_action = 'verify' THEN
        -- Separate verify action (if needed elsewhere)
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
    ELSIF p_action = 'suspended' THEN
        -- Explicit suspension
        UPDATE dental_laboratories
        SET account_status = 'suspended', is_active = FALSE, updated_at = NOW()
        WHERE id = p_lab_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION toggle_lab_activation TO authenticated;
