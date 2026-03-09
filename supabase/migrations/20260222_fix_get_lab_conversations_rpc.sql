-- Fix get_lab_conversations to read from lab_chat_conversations instead of lab_conversations
-- and properly join doctor and clinic details.

CREATE OR REPLACE FUNCTION get_lab_conversations(p_user_id UUID)
RETURNS JSONB AS $$
BEGIN
    RETURN (
        SELECT COALESCE(jsonb_agg(row_to_json(c.*)), '[]'::jsonb)
        FROM (
            SELECT 
                lc.id AS conversation_id,
                cl.name AS clinic_name,
                p.full_name AS doctor_name,
                d.order_number,
                lc.last_message AS last_message_content,
                lc.last_message_date,
                (
                    SELECT COUNT(*)
                    FROM lab_chat_messages msg
                    WHERE msg.conversation_id = lc.id
                      AND msg.sender_id != p_user_id
                      AND msg.is_read = FALSE
                ) AS unread_count,
                'clinic' AS type
            FROM lab_chat_conversations lc
            LEFT JOIN profiles p ON lc.doctor_id = p.id
            LEFT JOIN clinics cl ON p.clinic_id = cl.id
            LEFT JOIN dental_lab_orders d ON lc.order_id = d.id
            WHERE lc.lab_id = p_user_id OR lc.doctor_id = p_user_id
            ORDER BY lc.last_message_date DESC NULLS LAST
        ) c
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
