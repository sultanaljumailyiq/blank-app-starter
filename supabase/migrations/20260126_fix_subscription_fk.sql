-- Comprehensive fix for subscription_requests table schema

DO $$ 
BEGIN
    -- 1. Ensure user_id column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_requests' AND column_name = 'user_id') THEN
        ALTER TABLE "subscription_requests" ADD COLUMN "user_id" UUID;
    END IF;

    -- 2. Ensure doctor_id column exists (synonym to user_id often used in code)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_requests' AND column_name = 'doctor_id') THEN
        ALTER TABLE "subscription_requests" ADD COLUMN "doctor_id" UUID;
    END IF;

    -- 3. Add constraint for doctor_id
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscription_requests_doctor_id_fkey'
    ) THEN
        ALTER TABLE "subscription_requests" 
        ADD CONSTRAINT "subscription_requests_doctor_id_fkey" 
        FOREIGN KEY ("doctor_id") 
        REFERENCES "profiles" ("id") ON DELETE SET NULL;
    END IF;

    -- 4. Add constraint for user_id
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscription_requests_user_id_fkey'
    ) THEN
        ALTER TABLE "subscription_requests" 
        ADD CONSTRAINT "subscription_requests_user_id_fkey" 
        FOREIGN KEY ("user_id") 
        REFERENCES "profiles" ("id") ON DELETE SET NULL;
    END IF;

END $$;
