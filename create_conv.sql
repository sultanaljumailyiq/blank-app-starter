
DECLARE
    v_lab_id UUID;
    v_lab_user_id UUID;
    v_clinic_id INTEGER;
    v_conv_id BIGINT;
BEGIN
    SELECT laboratory_id, clinic_id INTO v_lab_id, v_clinic_id
    FROM dental_lab_orders
    WHERE id = p_order_id;
    
    SELECT user_id INTO v_lab_user_id
    FROM dental_laboratories
    WHERE id = v_lab_id;

    SELECT id INTO v_conv_id
    FROM lab_chat_conversations
    WHERE clinic_id = v_clinic_id AND lab_id = v_lab_user_id
    ORDER BY id DESC
    LIMIT 1;

    IF v_conv_id IS NULL THEN
        INSERT INTO lab_chat_conversations (doctor_id, lab_id, clinic_id, conversation_type)
        VALUES (p_doctor_id, v_lab_user_id, v_clinic_id, 'clinic_general')
        RETURNING id INTO v_conv_id;
    END IF;

    RETURN v_conv_id;
END;
