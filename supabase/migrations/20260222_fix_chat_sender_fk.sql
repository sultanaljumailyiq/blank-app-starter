-- Fix PGRST200 relating to lab_chat_messages joining profiles
-- Change sender_id foreign key from auth.users to profiles to allow direct joining

DO $$
BEGIN
    -- Drop the existing constraint if it exists (usually auth.users(id))
    BEGIN
        ALTER TABLE lab_chat_messages DROP CONSTRAINT lab_chat_messages_sender_id_fkey;
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;

    -- Add the new constraint mapping to profiles(id)
    ALTER TABLE lab_chat_messages
    ADD CONSTRAINT lab_chat_messages_sender_id_fkey
    FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;
END $$;
