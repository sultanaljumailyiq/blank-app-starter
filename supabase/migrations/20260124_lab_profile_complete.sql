-- =============================================
-- LAB DELETE POLICY AND PROFILE INTEGRATION
-- =============================================

-- 1. ADD DELETE POLICY FOR LABS
DROP POLICY IF EXISTS "Labs can delete their orders" ON dental_lab_orders;
CREATE POLICY "Labs can delete their orders"
    ON dental_lab_orders FOR DELETE
    USING (
        laboratory_id IN (
            SELECT id FROM dental_laboratories WHERE user_id = auth.uid()
        )
    );

-- 2. ADD is_verified FIELD TO dental_laboratories (Admin-only control)
ALTER TABLE dental_laboratories
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS establishment_year INTEGER,
ADD COLUMN IF NOT EXISTS license_expiry DATE,
ADD COLUMN IF NOT EXISTS two_factor_auth BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS emergency_service BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS auto_accept_orders BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS delivery_radius INTEGER DEFAULT 25;

-- 3. UPDATE update_lab_profile RPC TO SAVE SETTINGS
DROP FUNCTION IF EXISTS update_lab_profile(uuid, text, text, text, text, text, text, text, text[]);

CREATE OR REPLACE FUNCTION update_lab_profile(
    p_user_id UUID,
    p_lab_name TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_logo_url TEXT DEFAULT NULL,
    p_specialties TEXT[] DEFAULT NULL,
    p_establishment_year INTEGER DEFAULT NULL,
    p_license_number TEXT DEFAULT NULL,
    p_license_expiry DATE DEFAULT NULL,
    p_two_factor_auth BOOLEAN DEFAULT NULL,
    p_email_notifications BOOLEAN DEFAULT NULL,
    p_emergency_service BOOLEAN DEFAULT NULL,
    p_auto_accept_orders BOOLEAN DEFAULT NULL,
    p_delivery_radius INTEGER DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_lab_id UUID;
BEGIN
    -- Get lab ID from user_id
    SELECT id INTO v_lab_id FROM dental_laboratories WHERE user_id = p_user_id;
    IF v_lab_id IS NULL THEN
        RAISE EXCEPTION 'Lab not found for user';
    END IF;
    
    UPDATE dental_laboratories
    SET 
        lab_name = COALESCE(p_lab_name, lab_name),
        name = COALESCE(p_lab_name, name),
        description = COALESCE(p_description, description),
        phone = COALESCE(p_phone, phone),
        email = COALESCE(p_email, email),
        address = COALESCE(p_address, address),
        city = COALESCE(p_city, city),
        logo_url = COALESCE(p_logo_url, logo_url),
        specialties = COALESCE(p_specialties, specialties),
        establishment_year = COALESCE(p_establishment_year, establishment_year),
        license_number = COALESCE(p_license_number, license_number),
        license_expiry = COALESCE(p_license_expiry, license_expiry),
        two_factor_auth = COALESCE(p_two_factor_auth, two_factor_auth),
        email_notifications = COALESCE(p_email_notifications, email_notifications),
        emergency_service = COALESCE(p_emergency_service, emergency_service),
        auto_accept_orders = COALESCE(p_auto_accept_orders, auto_accept_orders),
        delivery_radius = COALESCE(p_delivery_radius, delivery_radius),
        updated_at = NOW()
    WHERE id = v_lab_id;
    
    RETURN v_lab_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CREATE get_lab_profile RPC TO LOAD SETTINGS
CREATE OR REPLACE FUNCTION get_lab_profile(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT to_jsonb(dl.*) INTO v_result 
    FROM dental_laboratories dl 
    WHERE dl.user_id = p_user_id;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. ADMIN VERIFY LAB RPC (Admin only)
CREATE OR REPLACE FUNCTION admin_verify_lab(
    p_admin_id UUID,
    p_lab_id UUID,
    p_verified BOOLEAN
) RETURNS BOOLEAN AS $$
DECLARE
    v_is_admin BOOLEAN;
BEGIN
    -- Check if user is admin
    SELECT EXISTS(
        SELECT 1 FROM auth.users 
        WHERE id = p_admin_id 
        AND raw_user_meta_data->>'role' = 'admin'
    ) INTO v_is_admin;
    
    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Unauthorized: Only admins can verify labs';
    END IF;
    
    UPDATE dental_laboratories
    SET is_verified = p_verified, updated_at = NOW()
    WHERE id = p_lab_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
