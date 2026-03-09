-- 20260223_unified_clinic_chat.sql

-- 1. Create a generic function to fetch or create a conversation between a clinic and a laboratory
CREATE OR REPLACE FUNCTION get_or_create_shared_lab_chat(p_lab_id UUID, p_clinic_id INTEGER, p_user_id UUID)
RETURNS BIGINT AS $$
DECLARE
    v_conv_id BIGINT;
BEGIN
    -- Try to find an existing generic conversation between this clinic and lab
    SELECT id INTO v_conv_id
    FROM lab_chat_conversations
    WHERE clinic_id = p_clinic_id AND lab_id = p_lab_id
    ORDER BY created_at ASC
    LIMIT 1;

    -- If none exists, create one
    IF v_conv_id IS NULL THEN
        -- We no longer link to a specific order, though doctor_id is retained as the conversation initiator for legacy reasons
        INSERT INTO lab_chat_conversations (doctor_id, lab_id, clinic_id, conversation_type)
        VALUES (p_user_id, p_lab_id, p_clinic_id, 'clinic_general')
        RETURNING id INTO v_conv_id;
    END IF;

    RETURN v_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Modify to get_lab_conversations so it groups by clinic to avoid duplicates if old orders created multiple threads
-- We simply adjust the output to pick the latest message.
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
                NULL AS order_number, -- Removed dependency on order_number mapping
                lc.last_message AS last_message_content,
                lc.last_message_date,
                lc.lab_id,
                lc.doctor_id,
                lc.clinic_id,
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
            LEFT JOIN clinics cl ON lc.clinic_id = cl.id
            -- Filter out conversations that are redundant per clinic (only taking latest)
            WHERE lc.id IN (
                SELECT max(id) FROM lab_chat_conversations 
                WHERE clinic_id IS NOT NULL AND lab_id IS NOT NULL
                GROUP BY clinic_id, lab_id
            )
            AND (
                lc.lab_id = p_user_id 
                OR lc.doctor_id = p_user_id
                OR lc.clinic_id IN (
                    SELECT clinic_id FROM staff WHERE auth_user_id = p_user_id
                    UNION 
                    SELECT id FROM clinics WHERE owner_id = p_user_id
                )
            )
            ORDER BY lc.last_message_date DESC NULLS LAST
        ) c
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
