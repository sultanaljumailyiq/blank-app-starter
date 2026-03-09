-- دالة إنشاء محادثة جديدة
CREATE OR REPLACE FUNCTION create_lab_conversation(
  p_doctor_id UUID,
  p_lab_id UUID,
  p_order_id UUID
)
RETURNS TABLE (
  conversation_id INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conv_id INTEGER;
BEGIN
  -- التحقق من وجود المحادثة مسبقاً
  SELECT id INTO conv_id
  FROM lab_conversations 
  WHERE doctor_id = p_doctor_id 
    AND lab_id = p_lab_id 
    AND order_id = p_order_id;
    
  IF conv_id IS NULL THEN
    -- إنشاء محادثة جديدة
    INSERT INTO lab_conversations (
      doctor_id, lab_id, order_id, last_message_date
    ) VALUES (
      p_doctor_id, p_lab_id, p_order_id, NOW()
    ) RETURNING id INTO conv_id;
  END IF;
  
  -- إرجاع النتائج
  RETURN QUERY
  SELECT conv_id, NOW();
END;
$$;

-- دالة إرسال رسالة جديدة
CREATE OR REPLACE FUNCTION send_lab_message(
  p_conversation_id INTEGER,
  p_sender_id UUID,
  p_message_type TEXT,
  p_message_content TEXT,
  p_file_url TEXT DEFAULT NULL
)
RETURNS TABLE (
  message_id INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  msg_id INTEGER;
BEGIN
  -- إدراج الرسالة
  INSERT INTO lab_messages (
    conversation_id, sender_id, message_type, message_content, file_url
  ) VALUES (
    p_conversation_id, p_sender_id, p_message_type, p_message_content, p_file_url
  ) RETURNING id INTO msg_id;
  
  -- تحديث آخر رسالة في المحادثة
  UPDATE lab_conversations
  SET last_message_date = NOW()
  WHERE id = p_conversation_id;
  
  -- إرجاع النتائج
  RETURN QUERY
  SELECT msg_id, NOW();
END;
$$;

-- دالة جلب المحادثات
CREATE OR REPLACE FUNCTION get_lab_conversations(
  p_user_id UUID
)
RETURNS TABLE (
  conversation_id INTEGER,
  doctor_id UUID,
  lab_id UUID,
  order_id UUID,
  last_message_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  doctor_name TEXT,
  lab_name TEXT,
  order_number TEXT,
  unread_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lc.id,
    lc.doctor_id,
    lc.lab_id,
    lc.order_id,
    lc.last_message_date,
    lc.created_at,
    p1.full_name as doctor_name,
    p2.full_name as lab_name,
    dlo.order_number,
    COALESCE(unread.unread_count, 0) as unread_count
  FROM lab_conversations lc
  LEFT JOIN profiles p1 ON lc.doctor_id = p1.id
  LEFT JOIN profiles p2 ON lc.lab_id = p2.id
  LEFT JOIN dental_lab_orders dlo ON lc.order_id = dlo.id
  LEFT JOIN (
    SELECT 
      lm.conversation_id,
      COUNT(*) as unread_count
    FROM lab_messages lm
    WHERE lm.is_read = FALSE AND lm.sender_id != p_user_id
    GROUP BY lm.conversation_id
  ) unread ON lc.id = unread.conversation_id
  WHERE lc.doctor_id = p_user_id OR lc.lab_id = p_user_id
  ORDER BY lc.last_message_date DESC;
END;
$$;

-- دالة جلب رسائل المحادثة
CREATE OR REPLACE FUNCTION get_conversation_messages(
  p_conversation_id INTEGER
)
RETURNS TABLE (
  message_id INTEGER,
  sender_id UUID,
  message_type TEXT,
  message_content TEXT,
  file_url TEXT,
  is_read BOOLEAN,
  created_at TIMESTAMPTZ,
  sender_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    lm.id,
    lm.sender_id,
    lm.message_type,
    lm.message_content,
    lm.file_url,
    lm.is_read,
    lm.created_at,
    p.full_name as sender_name
  FROM lab_messages lm
  LEFT JOIN profiles p ON lm.sender_id = p.id
  WHERE lm.conversation_id = p_conversation_id
  ORDER BY lm.created_at;
END;
$$;

-- دالة قراءة الرسائل
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  p_conversation_id INTEGER,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE lab_messages
  SET is_read = TRUE
  WHERE conversation_id = p_conversation_id 
    AND sender_id != p_user_id;
END;
$$;