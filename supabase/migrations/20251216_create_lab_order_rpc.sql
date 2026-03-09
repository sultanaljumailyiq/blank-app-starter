-- Create a function to handle lab order creation securely
CREATE OR REPLACE FUNCTION create_dental_lab_order(
    clinic_id UUID,
    laboratory_id UUID,
    patient_id UUID,
    service_name TEXT,
    priority TEXT,
    notes TEXT,
    patient_name TEXT,
    status TEXT DEFAULT 'pending'
) RETURNS JSONB AS $$
DECLARE
    new_order_id UUID;
    order_number TEXT;
    clinic_name TEXT;
    lab_name TEXT;
    result JSONB;
BEGIN
    -- Generate Order Number (e.g., ORD-20251216-XXXX)
    order_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || substring(md5(random()::text) from 1 for 4);

    -- Get Clinic Name
    SELECT name INTO clinic_name FROM clinics WHERE id = clinic_id;
    
    -- Get Lab Name
    SELECT lab_name INTO lab_name FROM dental_laboratories WHERE id = laboratory_id;

    -- Insert Order
    INSERT INTO dental_lab_orders (
        clinic_id,
        laboratory_id,
        patient_id,
        order_number,
        patient_name,
        service_name,
        priority,
        status,
        notes,
        created_at,
        updated_at
    ) VALUES (
        clinic_id,
        laboratory_id,
        patient_id,
        order_number,
        patient_name,
        service_name,
        priority,
        status,
        notes,
        now(),
        now()
    ) RETURNING id INTO new_order_id;

    -- Return the created order details
    SELECT jsonb_build_object(
        'id', new_order_id,
        'order_number', order_number,
        'status', status
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
