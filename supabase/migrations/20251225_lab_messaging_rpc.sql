-- RPC: Get Lab Conversations with Clinic Details
CREATE OR REPLACE FUNCTION get_lab_conversations(p_user_id UUID)
RETURNS TABLE (
    conversation_id BIGINT,
    doctor_id UUID,
    lab_id UUID,
    order_id UUID,
    last_message_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    doctor_name VARCHAR,
    lab_name VARCHAR,
    order_number VARCHAR,
    clinic_name VARCHAR,
    clinic_phone VARCHAR,
    unread_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as conversation_id,
        c.doctor_id,
        c.lab_id,
        c.order_id,
        c.last_message_date,
        c.created_at,
        d.full_name::VARCHAR as doctor_name,
        l.lab_name::VARCHAR as lab_name,
        o.order_number::VARCHAR as order_number,
        COALESCE(cl.name, 'Unknown Clinic')::VARCHAR as clinic_name,
        COALESCE(cl.phone, '')::VARCHAR as clinic_phone,
        (SELECT COUNT(*) FROM lab_chat_messages m WHERE m.conversation_id = c.id AND m.is_read = FALSE AND m.sender_id != p_user_id)::BIGINT as unread_count
    FROM lab_chat_conversations c
    JOIN dental_laboratories l ON c.lab_id = l.user_id
    JOIN doctors d ON c.doctor_id = d.id
    LEFT JOIN dental_lab_orders o ON c.order_id = o.id
    LEFT JOIN clinics cl ON o.clinic_id = cl.id
    WHERE c.lab_id = p_user_id
    ORDER BY c.last_message_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
