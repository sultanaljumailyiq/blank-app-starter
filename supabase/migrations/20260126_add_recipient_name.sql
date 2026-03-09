DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_methods' AND column_name = 'recipient_name') THEN
        ALTER TABLE payment_methods ADD COLUMN recipient_name TEXT DEFAULT '';
    END IF;
END $$;
