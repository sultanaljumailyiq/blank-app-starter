-- Helper: get_orders_by_status (Updated to include Clinic details)
CREATE OR REPLACE FUNCTION get_orders_by_status(p_lab_id UUID, p_status TEXT DEFAULT NULL)
RETURNS TABLE (
    order_id UUID,
    order_number VARCHAR,
    patient_name VARCHAR,
    doctor_name VARCHAR,
    doctor_phone VARCHAR,
    clinic_name VARCHAR,
    clinic_phone VARCHAR,
    clinic_address VARCHAR,
    service_name VARCHAR,
    status VARCHAR,
    priority VARCHAR,
    order_date TIMESTAMP WITH TIME ZONE,
    estimated_completion_date DATE,
    assigned_representative_name VARCHAR,
    total_amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id as order_id,
        o.order_number::VARCHAR,
        o.patient_name::VARCHAR,
        COALESCE(p.full_name, 'Unknown Doctor')::VARCHAR as doctor_name,
        COALESCE(p.phone, '')::VARCHAR as doctor_phone,
        COALESCE(c.name, 'Unknown Clinic')::VARCHAR as clinic_name,
        COALESCE(c.phone, '')::VARCHAR as clinic_phone,
        COALESCE(c.address, '')::VARCHAR as clinic_address,
        o.service_name::VARCHAR,
        o.status::VARCHAR,
        o.priority::VARCHAR,
        o.created_at as order_date,
        o.expected_delivery_date as estimated_completion_date,
        -- Representative name (mock for now or join if we had the column)
        NULL::VARCHAR as assigned_representative_name,
        o.price as total_amount
    FROM dental_lab_orders o
    LEFT JOIN profiles p ON o.doctor_id = p.id
    LEFT JOIN clinics c ON o.clinic_id = c.id
    WHERE o.laboratory_id = p_lab_id
    AND (p_status IS NULL OR o.status = p_status)
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
