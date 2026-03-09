-- ====================================================
-- Lab System Full Migration
-- Date: 2026-02-21
-- ====================================================

-- 1. dental_lab_orders - Add missing columns
-- ====================================================
ALTER TABLE dental_lab_orders ADD COLUMN IF NOT EXISTS delegate_id uuid;
ALTER TABLE dental_lab_orders ADD COLUMN IF NOT EXISTS delegate_name text;
ALTER TABLE dental_lab_orders ADD COLUMN IF NOT EXISTS is_return_cycle boolean DEFAULT false;
ALTER TABLE dental_lab_orders ADD COLUMN IF NOT EXISTS return_reason text;
ALTER TABLE dental_lab_orders ADD COLUMN IF NOT EXISTS paid_amount numeric DEFAULT 0;
ALTER TABLE dental_lab_orders ADD COLUMN IF NOT EXISTS delivery_date date;
ALTER TABLE dental_lab_orders ADD COLUMN IF NOT EXISTS files jsonb DEFAULT '[]';
ALTER TABLE dental_lab_orders ADD COLUMN IF NOT EXISTS description text;

-- 2. lab_chat_conversations - Add sync/display columns
-- ====================================================
ALTER TABLE lab_chat_conversations ADD COLUMN IF NOT EXISTS clinic_id integer;
ALTER TABLE lab_chat_conversations ADD COLUMN IF NOT EXISTS clinic_name text;
ALTER TABLE lab_chat_conversations ADD COLUMN IF NOT EXISTS lab_name text;
ALTER TABLE lab_chat_conversations ADD COLUMN IF NOT EXISTS conversation_type text DEFAULT 'order';
ALTER TABLE lab_chat_conversations ADD COLUMN IF NOT EXISTS last_message text;
ALTER TABLE lab_chat_conversations ADD COLUMN IF NOT EXISTS unread_count_lab integer DEFAULT 0;
ALTER TABLE lab_chat_conversations ADD COLUMN IF NOT EXISTS unread_count_clinic integer DEFAULT 0;

-- 3. lab_chat_messages - Add sender identity + order tracking columns
-- ====================================================
ALTER TABLE lab_chat_messages ADD COLUMN IF NOT EXISTS sender_name text;
ALTER TABLE lab_chat_messages ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text';
ALTER TABLE lab_chat_messages ADD COLUMN IF NOT EXISTS file_url text;
ALTER TABLE lab_chat_messages ADD COLUMN IF NOT EXISTS order_id uuid;
ALTER TABLE lab_chat_messages ADD COLUMN IF NOT EXISTS staff_record_id integer;

-- 4. clinic_lab_favorites - Mark custom labs
-- ====================================================
ALTER TABLE clinic_lab_favorites ADD COLUMN IF NOT EXISTS is_custom boolean DEFAULT false;

-- 5. Remove unused/duplicate tables (CASCADE to drop dependent objects)
-- ====================================================
DROP TABLE IF EXISTS clinic_saved_labs CASCADE;
DROP TABLE IF EXISTS lab_delegates CASCADE;
DROP TABLE IF EXISTS lab_conversation_messages CASCADE;
DROP TABLE IF EXISTS lab_conversations CASCADE;
DROP TABLE IF EXISTS dental_lab_orders_backup CASCADE;
