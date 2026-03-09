-- 1. Update get_orders_by_status
DROP FUNCTION IF EXISTS get_orders_by_status(uuid, text);

CREATE OR REPLACE FUNCTION get_orders_by_status(p_lab_id UUID, p_status TEXT DEFAULT NULL)
RETURNS TABLE (
    order_id UUID,
    order_number VARCHAR,
    patient_name VARCHAR,
    doctor_name VARCHAR,
    service_name VARCHAR,
    status VARCHAR,
    priority VARCHAR,
    order_date TIMESTAMP WITH TIME ZONE,
    estimated_completion_date DATE,
    assigned_representative_name VARCHAR,
    total_amount DECIMAL,
    clinic_name VARCHAR,
    clinic_phone VARCHAR,
    clinic_address VARCHAR,
    doctor_phone VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id as order_id,
        o.order_number::VARCHAR,
        o.patient_name::VARCHAR,
        o.doctor_name::VARCHAR,
        o.service_name::VARCHAR,
        o.status::VARCHAR,
        o.priority::VARCHAR,
        o.created_at as order_date,
        o.expected_delivery_date as estimated_completion_date,
        NULL::VARCHAR as assigned_representative_name,
        o.final_amount as total_amount,
        c.name::VARCHAR as clinic_name,
        c.phone::VARCHAR as clinic_phone,
        c.address::VARCHAR as clinic_address,
        NULL::VARCHAR as doctor_phone -- We don't have doctor phone easily accessible, passing null
    FROM dental_lab_orders o
    LEFT JOIN clinics c ON o.clinic_id = c.id
    WHERE o.laboratory_id = p_lab_id
    AND (p_status IS NULL OR o.status = p_status)
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Create update_order_status
CREATE OR REPLACE FUNCTION update_order_status(
    p_order_id UUID,
    p_status_changed_by UUID, -- Auth ID of user changing status
    p_new_status TEXT,
    p_status_description TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_lab_id UUID;
    v_order_num TEXT;
BEGIN
    -- Update Order
    UPDATE dental_lab_orders
    SET 
        status = p_new_status,
        notes = COALESCE(p_notes, notes), -- Append or replace? Replaces for now.
        updated_at = NOW()
    WHERE id = p_order_id
    RETURNING laboratory_id, order_number INTO v_lab_id, v_order_num;

    -- Log Activity (Best Effort)
    BEGIN
        INSERT INTO lab_activity_logs (lab_id, order_id, activity_type, description, created_by)
        VALUES (
            v_lab_id, 
            p_order_id, 
            'status_change', 
            COALESCE(p_status_description, 'Status updated to ' || p_new_status), 
            p_status_changed_by
        );
    EXCEPTION WHEN OTHERS THEN
        -- Ignore log failure
    END;

    RETURN p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
