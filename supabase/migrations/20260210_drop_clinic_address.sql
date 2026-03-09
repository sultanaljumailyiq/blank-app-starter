-- 1. Update get_orders_by_status to remove clinic_address
DROP FUNCTION IF EXISTS get_orders_by_status(UUID, VARCHAR);

CREATE OR REPLACE FUNCTION get_orders_by_status(p_lab_id UUID, p_status VARCHAR DEFAULT NULL)
RETURNS TABLE (
    order_id UUID,
    order_number VARCHAR,
    patient_name VARCHAR,
    doctor_name VARCHAR,
    doctor_phone VARCHAR,
    clinic_name VARCHAR,
    clinic_phone VARCHAR,
    -- clinic_address VARCHAR, -- REMOVED
    clinic_governorate VARCHAR,
    clinic_city VARCHAR,
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
        NULL::VARCHAR as doctor_phone,
        c.name::VARCHAR as clinic_name,
        c.phone::VARCHAR as clinic_phone,
        -- c.address::VARCHAR as clinic_address, -- REMOVED
        c.governorate::VARCHAR as clinic_governorate,
        c.city::VARCHAR as clinic_city,
        o.service_name::VARCHAR,
        o.status::VARCHAR,
        o.priority::VARCHAR,
        o.created_at as order_date,
        (o.created_at + INTERVAL '3 days') as estimated_completion_date,
        NULL::VARCHAR as assigned_representative_name,
        COALESCE(o.price, 0) as total_amount
    FROM dental_lab_orders o
    LEFT JOIN clinics c ON o.clinic_id = c.id
    WHERE o.laboratory_id = p_lab_id
    AND (p_status IS NULL OR o.status = p_status)
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 2. Drop address column from clinics table
ALTER TABLE clinics DROP COLUMN IF EXISTS address;
