-- Fix the name column constraint and update RPC

-- 1. Make old 'name' column nullable
ALTER TABLE dental_lab_representatives ALTER COLUMN name DROP NOT NULL;

-- 2. Recreate add_representative to set both name and full_name
DROP FUNCTION IF EXISTS add_representative(uuid, uuid, text, text, text, text, text, integer, jsonb);

CREATE OR REPLACE FUNCTION add_representative(
    p_laboratory_id UUID,
    p_user_id UUID,
    p_full_name TEXT,
    p_phone TEXT,
    p_email TEXT DEFAULT NULL,
    p_position TEXT DEFAULT NULL,
    p_representative_type TEXT DEFAULT 'delivery',
    p_max_assignments INTEGER DEFAULT 5,
    p_working_hours JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_rep_id UUID;
    v_real_lab_id UUID;
BEGIN
    -- Get lab ID from user_id if needed
    SELECT id INTO v_real_lab_id FROM dental_laboratories WHERE user_id = p_laboratory_id;
    IF v_real_lab_id IS NULL THEN
        v_real_lab_id := p_laboratory_id; -- Assume it's already the Lab ID
    END IF;

    INSERT INTO dental_lab_representatives (
        laboratory_id,
        lab_id,
        user_id,
        full_name,
        name,
        phone,
        email,
        "position",
        representative_type,
        max_assignments,
        working_hours,
        status,
        is_active
    ) VALUES (
        v_real_lab_id,
        v_real_lab_id,
        p_user_id,
        p_full_name,
        p_full_name,  -- Also set legacy 'name' column
        p_phone,
        p_email,
        p_position,
        p_representative_type,
        p_max_assignments,
        p_working_hours,
        'available',
        TRUE
    ) RETURNING id INTO v_rep_id;
    
    RETURN v_rep_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
