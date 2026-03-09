-- =============================================
-- FIX DATABASE SCHEMA ERRORS
-- =============================================

-- 1. FIX lab_services - Add lab_id column if missing
ALTER TABLE lab_services 
ADD COLUMN IF NOT EXISTS lab_id UUID REFERENCES dental_laboratories(id) ON DELETE CASCADE;

-- Backfill lab_id from laboratory_id if it exists
UPDATE lab_services SET lab_id = laboratory_id WHERE lab_id IS NULL AND laboratory_id IS NOT NULL;

-- 2. FIX STATUS CHECK CONSTRAINT - Add 'in-progress' as valid value
ALTER TABLE dental_lab_orders DROP CONSTRAINT IF EXISTS dental_lab_orders_status_check;
ALTER TABLE dental_lab_orders ADD CONSTRAINT dental_lab_orders_status_check 
CHECK (status IN (
    'pending', 
    'waiting_for_representative', 
    'representative_dispatched', 
    'in_progress',
    'in-progress',  -- Support both formats
    'completed', 
    'out_for_delivery', 
    'delivered', 
    'returned', 
    'cancelled', 
    'rejected', 
    'modification_requested',
    'confirmed',
    'processing'
));

-- 3. CREATE get_lab_conversations RPC
CREATE OR REPLACE FUNCTION get_lab_conversations(p_user_id UUID)
RETURNS JSONB AS $$
BEGIN
    RETURN (
        SELECT COALESCE(jsonb_agg(row_to_json(c.*)), '[]'::jsonb)
        FROM lab_conversations c
        WHERE c.lab_user_id = p_user_id OR c.clinic_user_id = p_user_id
        ORDER BY c.updated_at DESC
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CREATE get_conversation_messages RPC
CREATE OR REPLACE FUNCTION get_conversation_messages(p_conversation_id UUID)
RETURNS JSONB AS $$
BEGIN
    RETURN (
        SELECT COALESCE(jsonb_agg(row_to_json(m.*) ORDER BY m.created_at ASC), '[]'::jsonb)
        FROM lab_conversation_messages m
        WHERE m.conversation_id = p_conversation_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CREATE send_lab_message RPC
CREATE OR REPLACE FUNCTION send_lab_message(
    p_conversation_id UUID,
    p_content TEXT,
    p_message_type TEXT DEFAULT 'text',
    p_sender_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_msg_id UUID;
BEGIN
    INSERT INTO lab_conversation_messages (
        conversation_id,
        sender_id,
        content,
        message_type,
        created_at
    ) VALUES (
        p_conversation_id,
        COALESCE(p_sender_id, auth.uid()),
        p_content,
        p_message_type,
        NOW()
    ) RETURNING id INTO v_msg_id;
    
    -- Update conversation timestamp
    UPDATE lab_conversations
    SET updated_at = NOW(), last_message = p_content
    WHERE id = p_conversation_id;
    
    RETURN v_msg_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Ensure lab_conversations table exists
CREATE TABLE IF NOT EXISTS lab_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES dental_lab_orders(id) ON DELETE CASCADE,
    lab_user_id UUID REFERENCES auth.users(id),
    clinic_user_id UUID REFERENCES auth.users(id),
    lab_id UUID REFERENCES dental_laboratories(id),
    clinic_id INTEGER REFERENCES clinics(id),
    last_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Ensure lab_conversation_messages table exists
CREATE TABLE IF NOT EXISTS lab_conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES lab_conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Enable RLS on conversation tables
ALTER TABLE lab_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_conversation_messages ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for conversations
DROP POLICY IF EXISTS "Users can view their conversations" ON lab_conversations;
CREATE POLICY "Users can view their conversations"
    ON lab_conversations FOR SELECT
    USING (lab_user_id = auth.uid() OR clinic_user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their messages" ON lab_conversation_messages;
CREATE POLICY "Users can view their messages"
    ON lab_conversation_messages FOR SELECT
    USING (
        conversation_id IN (
            SELECT id FROM lab_conversations 
            WHERE lab_user_id = auth.uid() OR clinic_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert messages" ON lab_conversation_messages;
CREATE POLICY "Users can insert messages"
    ON lab_conversation_messages FOR INSERT
    WITH CHECK (
        conversation_id IN (
            SELECT id FROM lab_conversations 
            WHERE lab_user_id = auth.uid() OR clinic_user_id = auth.uid()
        )
    );
