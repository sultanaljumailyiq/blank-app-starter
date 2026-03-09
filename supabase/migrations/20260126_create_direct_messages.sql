CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert messages" ON direct_messages;
CREATE POLICY "Users can insert messages" ON direct_messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can view their messages" ON direct_messages;
CREATE POLICY "Users can view their messages" ON direct_messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can update read status" ON direct_messages;
CREATE POLICY "Users can update read status" ON direct_messages FOR UPDATE
USING (auth.uid() = recipient_id);
