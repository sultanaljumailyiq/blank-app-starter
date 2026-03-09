-- =============================================
-- Doctor Chat Features
-- =============================================

-- Ensure we can get Lab Name in conversations
CREATE OR REPLACE FUNCTION get_user_conversations(p_user_id UUID)
RETURNS TABLE (
    conversation_id BIGINT,
    doctor_id UUID,
    lab_id UUID,
    order_id UUID,
    last_message_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    other_party_name VARCHAR,
    order_number VARCHAR,
    unread_count BIGINT
) AS $$
DECLARE
    v_is_doctor BOOLEAN;
BEGIN
    -- Check if user is a doctor
    SELECT EXISTS(SELECT 1 FROM doctors WHERE id = p_user_id) INTO v_is_doctor;

    IF v_is_doctor THEN
        -- Return conversations for Doctor (Show Lab Name)
        RETURN QUERY
        SELECT 
            c.id,
            c.doctor_id,
            c.lab_id,
            c.order_id,
            c.last_message_date,
            c.created_at,
            COALESCE(l.lab_name, 'Unknown Lab')::VARCHAR as other_party_name,
            o.order_number,
            (SELECT COUNT(*) FROM lab_chat_messages m WHERE m.conversation_id = c.id AND m.is_read = FALSE AND m.sender_id != p_user_id) as unread_count
        FROM lab_chat_conversations c
        JOIN dental_laboratories l ON c.lab_id = l.user_id
        LEFT JOIN dental_lab_orders o ON c.order_id = o.id
        WHERE c.doctor_id = (SELECT id FROM doctors WHERE id = p_user_id);
    ELSE
        -- Return conversations for Lab (Show Doctor Name)
        RETURN QUERY
        SELECT 
            c.id,
            c.doctor_id,
            c.lab_id,
            c.order_id,
            c.last_message_date,
            c.created_at,
            d.full_name::VARCHAR as other_party_name,
            o.order_number,
            (SELECT COUNT(*) FROM lab_chat_messages m WHERE m.conversation_id = c.id AND m.is_read = FALSE AND m.sender_id != p_user_id) as unread_count
        FROM lab_chat_conversations c
        JOIN doctors d ON c.doctor_id = d.id
        LEFT JOIN dental_lab_orders o ON c.order_id = o.id
        WHERE c.lab_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: create_conversation_for_order
CREATE OR REPLACE FUNCTION create_conversation_for_order(
    p_order_id UUID,
    p_doctor_id UUID -- This is the AUTH ID of the doctor
) RETURNS BIGINT AS $$
DECLARE
    v_lab_id UUID;
    v_doc_profile_id UUID;
    v_conv_id BIGINT;
BEGIN
    -- 1. Get real doctor profile ID
    SELECT id INTO v_doc_profile_id FROM doctors WHERE id = p_doctor_id;
    IF v_doc_profile_id IS NULL THEN
        -- Fallback: verify if p_doctor_id is already the profile ID or handle error
        -- Assuming p_doctor_id IS the auth id which matches the primary key of 'doctors' table in some schemas
        -- But properly we should lookup. If 'doctors' PK is uuid and matches auth.users.id:
        v_doc_profile_id := p_doctor_id;
    END IF;

    -- 2. Get Lab ID from Order
    SELECT laboratory_id INTO v_lab_id FROM dental_lab_orders WHERE id = p_order_id;
    
    IF v_lab_id IS NULL THEN
        RAISE EXCEPTION 'Cannot start chat for this order: No platform laboratory linked.';
    END IF;

    -- 3. Check existing conversation
    SELECT id INTO v_conv_id 
    FROM lab_chat_conversations 
    WHERE order_id = p_order_id;

    -- 4. Create if not exists
    IF v_conv_id IS NULL THEN
        INSERT INTO lab_chat_conversations (doctor_id, lab_id, order_id)
        VALUES (v_doc_profile_id, (SELECT user_id FROM dental_laboratories WHERE id = v_lab_id), p_order_id)
        RETURNING id INTO v_conv_id;
    END IF;

    RETURN v_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
