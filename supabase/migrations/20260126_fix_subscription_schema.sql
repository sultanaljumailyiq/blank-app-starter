-- Fix missing columns in subscription_requests
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_requests' AND column_name = 'payment_details') THEN
        ALTER TABLE subscription_requests ADD COLUMN payment_details JSONB DEFAULT '{}';
    END IF;
END $$;
