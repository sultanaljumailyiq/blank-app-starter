-- 20260223_fix_chat_clinic_access.sql

-- 1. Redefine create_conversation_for_order to insert clinic_id
CREATE OR REPLACE FUNCTION create_conversation_for_order(p_order_id UUID, p_doctor_id UUID)
RETURNS BIGINT AS $$
DECLARE
    v_lab_id UUID;
    v_lab_user_id UUID;
    v_clinic_id INTEGER;
    v_conv_id BIGINT;
BEGIN
    SELECT laboratory_id, clinic_id INTO v_lab_id, v_clinic_id
    FROM dental_lab_orders
    WHERE id = p_order_id;
    
    SELECT owner_id INTO v_lab_user_id
    FROM dental_laboratories
    WHERE id = v_lab_id;
    
    SELECT id INTO v_conv_id
    FROM lab_chat_conversations
    WHERE order_id = p_order_id
    LIMIT 1;

    IF v_conv_id IS NULL THEN
        INSERT INTO lab_chat_conversations (doctor_id, lab_id, order_id, clinic_id, conversation_type)
        VALUES (p_doctor_id, v_lab_user_id, p_order_id, v_clinic_id, 'order')
        RETURNING id INTO v_conv_id;
    END IF;

    RETURN v_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Retroactively update existing conversations with clinic_id from orders
UPDATE lab_chat_conversations lc
SET clinic_id = d.clinic_id
FROM dental_lab_orders d
WHERE lc.order_id = d.id AND lc.clinic_id IS NULL;

-- 3. Drop existing RLS policies
DROP POLICY IF EXISTS "Chat participants access" ON "public"."lab_chat_conversations";
DROP POLICY IF EXISTS "Message participants access" ON "public"."lab_chat_messages";

-- 4. Create new RLS policies allowing access by clinic_id
CREATE POLICY "Chat participants access" ON "public"."lab_chat_conversations"
FOR ALL USING (
    lab_id = auth.uid() 
    OR doctor_id = auth.uid() 
    OR clinic_id IN (
        SELECT clinic_id FROM staff WHERE auth_user_id = auth.uid()
        UNION
        SELECT id FROM clinics WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "Message participants access" ON "public"."lab_chat_messages"
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM lab_chat_conversations lc
        WHERE lc.id = lab_chat_messages.conversation_id
          AND (
              lc.lab_id = auth.uid() 
              OR lc.doctor_id = auth.uid() 
              OR lc.clinic_id IN (
                  SELECT clinic_id FROM staff WHERE auth_user_id = auth.uid()
                  UNION
                  SELECT id FROM clinics WHERE owner_id = auth.uid()
              )
          )
    )
);

-- 5. Redefine get_lab_conversations RPC to check clinic_id instead of just doctor_id
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
            LEFT JOIN clinics cl ON lc.clinic_id = cl.id
            LEFT JOIN dental_lab_orders d ON lc.order_id = d.id
            WHERE 
                lc.lab_id = p_user_id 
                OR lc.doctor_id = p_user_id
                OR lc.clinic_id IN (
                    SELECT clinic_id FROM staff WHERE auth_user_id = p_user_id
                    UNION 
                    SELECT id FROM clinics WHERE owner_id = p_user_id
                )
            ORDER BY lc.last_message_date DESC NULLS LAST
        ) c
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
