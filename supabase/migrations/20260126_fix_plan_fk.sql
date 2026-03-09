-- Check foreign key for plan_id

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscription_requests_plan_id_fkey'
    ) THEN
        ALTER TABLE "subscription_requests" 
        ADD CONSTRAINT "subscription_requests_plan_id_fkey" 
        FOREIGN KEY ("plan_id") 
        REFERENCES "subscription_plans" ("id") ON DELETE SET NULL;
    END IF;
END $$;
