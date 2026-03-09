-- Restore get_orders_by_status (Fixed: Type Casting)
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
    total_amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id as order_id,
        o.order_number::VARCHAR, -- Explicit cast
        o.patient_name::VARCHAR, -- Explicit cast
        o.doctor_name::VARCHAR, -- Explicit cast
        o.service_name::VARCHAR, -- Explicit cast
        o.status::VARCHAR, -- Explicit cast
        o.priority::VARCHAR, -- Explicit cast
        o.created_at as order_date,
        o.expected_delivery_date as estimated_completion_date,
        NULL::VARCHAR as assigned_representative_name,
        o.final_amount as total_amount
    FROM dental_lab_orders o
    WHERE o.laboratory_id = p_lab_id
    AND (p_status IS NULL OR o.status = p_status)
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Restore create_conversation_for_order (Unchanged)
CREATE OR REPLACE FUNCTION create_conversation_for_order(
    p_order_id UUID,
    p_doctor_id UUID
) RETURNS BIGINT AS $$
DECLARE
    v_lab_id UUID;
    v_lab_user_id UUID;
    v_doc_profile_id UUID;
    v_conv_id BIGINT;
BEGIN
    -- 1. Get real doctor profile ID
    SELECT id INTO v_doc_profile_id FROM profiles WHERE id = p_doctor_id;
    IF v_doc_profile_id IS NULL THEN
         v_doc_profile_id := p_doctor_id;
    END IF;

    -- 2. Get Lab ID from Order
    SELECT laboratory_id INTO v_lab_id FROM dental_lab_orders WHERE id = p_order_id;
    
    IF v_lab_id IS NULL THEN
        RAISE EXCEPTION 'Cannot start chat for this order: No platform laboratory linked.';
    END IF;

    -- Get Lab Owner User ID
    SELECT user_id INTO v_lab_user_id FROM dental_laboratories WHERE id = v_lab_id;

    -- 3. Check existing conversation
    SELECT id INTO v_conv_id 
    FROM lab_chat_conversations 
    WHERE order_id = p_order_id;

    -- 4. Create if not exists
    IF v_conv_id IS NULL THEN
        INSERT INTO lab_chat_conversations (doctor_id, lab_id, order_id)
        VALUES (v_doc_profile_id, v_lab_user_id, p_order_id)
        RETURNING id INTO v_conv_id;
    END IF;

    RETURN v_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
