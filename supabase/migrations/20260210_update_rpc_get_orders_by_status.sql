-- Update get_orders_by_status function to include clinic location details
CREATE OR REPLACE FUNCTION get_orders_by_status(p_lab_id UUID, p_status VARCHAR DEFAULT NULL)
RETURNS TABLE (
    order_id UUID,
    order_number VARCHAR,
    patient_name VARCHAR,
    doctor_name VARCHAR,
    doctor_phone VARCHAR,
    clinic_name VARCHAR,
    clinic_phone VARCHAR,
    clinic_address VARCHAR,
    clinic_governorate VARCHAR, -- New
    clinic_city VARCHAR,        -- New
    service_name VARCHAR,
    status VARCHAR,
    priority VARCHAR,
    order_date TIMESTAMP WITH TIME ZONE,
    estimated_completion_date TIMESTAMP WITH TIME ZONE,
    assigned_representative_name VARCHAR,
    total_amount NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id as order_id,
        o.order_number::VARCHAR,
        o.patient_name::VARCHAR,
        o.doctor_name::VARCHAR,
        NULL::VARCHAR as doctor_phone, -- Placeholder if column doesn't exist on orders
        c.name::VARCHAR as clinic_name,
        c.phone::VARCHAR as clinic_phone,
        c.address::VARCHAR as clinic_address,
        c.governorate::VARCHAR as clinic_governorate,
        c.city::VARCHAR as clinic_city,
        o.service_name::VARCHAR,
        o.status::VARCHAR,
        o.priority::VARCHAR,
        o.created_at as order_date,
        (o.created_at + INTERVAL '3 days') as estimated_completion_date, -- Approximate logic
        NULL::VARCHAR as assigned_representative_name, -- Placeholder
        COALESCE(o.price, 0) as total_amount
    FROM dental_lab_orders o
    LEFT JOIN clinics c ON o.clinic_id = c.id
    WHERE o.laboratory_id = p_lab_id
    AND (p_status IS NULL OR o.status = p_status)
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql;
