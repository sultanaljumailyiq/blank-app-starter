-- FIX: Update toggle_lab_activation to sync 'status' and 'account_status' and handle Verification Logic

DROP FUNCTION IF EXISTS toggle_lab_activation(UUID, TEXT, UUID);

CREATE OR REPLACE FUNCTION toggle_lab_activation(
    p_lab_id UUID,
    p_action TEXT,
    p_admin_id UUID
) RETURNS VOID AS $$
BEGIN
    IF p_action = 'activate' THEN
        UPDATE dental_laboratories
        SET 
            status = 'active', 
            account_status = 'active', 
            is_active = TRUE, 
            is_verified = TRUE, -- Requirement: Activate -> Verified
            verified_at = NOW(),
            verified_by = p_admin_id,
            updated_at = NOW()
        WHERE id = p_lab_id;
    ELSIF p_action = 'deactivate' THEN
        UPDATE dental_laboratories
        SET 
            status = 'pending', -- Requirement: Return to Pending Activation list
            account_status = 'pending', 
            is_active = FALSE, 
            is_verified = FALSE, 
            verified_at = NULL,
            verified_by = NULL,
            updated_at = NOW()
        WHERE id = p_lab_id;
    ELSIF p_action = 'verify' THEN
        UPDATE dental_laboratories
        SET 
            is_verified = TRUE, 
            verified_at = NOW(), 
            verified_by = p_admin_id, 
            status = 'active', -- Ensure active if verified
            account_status = 'active',
            updated_at = NOW()
        WHERE id = p_lab_id;
    ELSIF p_action = 'unverify' THEN
        UPDATE dental_laboratories
        SET 
            is_verified = FALSE, 
            verified_at = NULL, 
            verified_by = NULL, 
            updated_at = NOW()
        WHERE id = p_lab_id;
    ELSIF p_action = 'accredit' THEN
        UPDATE dental_laboratories
        SET 
            is_accredited = TRUE, 
            accredited_at = NOW(), 
            accredited_by = p_admin_id, 
            updated_at = NOW()
        WHERE id = p_lab_id;
    ELSIF p_action = 'unaccredit' THEN
        UPDATE dental_laboratories
        SET 
            is_accredited = FALSE, 
            accredited_at = NULL, 
            accredited_by = NULL, 
            updated_at = NOW()
        WHERE id = p_lab_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION toggle_lab_activation TO authenticated;
