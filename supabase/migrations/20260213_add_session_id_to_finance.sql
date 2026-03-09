-- Fix Finance Relations to Treatment System
-- Created: 2026-02-13

DO $$
BEGIN
    -- 1. Add session_id if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'session_id') THEN
        ALTER TABLE financial_transactions ADD COLUMN session_id UUID REFERENCES treatment_sessions(id) ON DELETE SET NULL;
        CREATE INDEX IF NOT EXISTS idx_finance_session_id ON financial_transactions(session_id);
    END IF;

    -- 2. Fix treatment_id Foreign Key
    -- It might be referencing 'treatments' (old schema) instead of 'tooth_treatment_plans' (new schema)
    -- Or it might be TEXT.
    
    -- Check if treatment_id exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'treatment_id') THEN
        
        -- Drop old constraint if exists (we have to guess the name or try generic)
        -- Common generic names: financial_transactions_treatment_id_fkey
        
        BEGIN
            ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS financial_transactions_treatment_id_fkey;
        EXCEPTION WHEN OTHERS THEN NULL; END;
        
        BEGIN
            ALTER TABLE financial_transactions DROP CONSTRAINT IF EXISTS fk_fin_treatment;
        EXCEPTION WHEN OTHERS THEN NULL; END;

        -- Ensure it's UUID
        -- ALTER TABLE financial_transactions ALTER COLUMN treatment_id TYPE UUID USING treatment_id::UUID; 
        -- (Careful: if it was text holding non-UUIDs, this fails. Assuming it holds UUIDs)

        -- Add correct constraint
        BEGIN
            ALTER TABLE financial_transactions 
            ADD CONSTRAINT fk_fin_treatment_plan 
            FOREIGN KEY (treatment_id) 
            REFERENCES tooth_treatment_plans(id) 
            ON DELETE SET NULL;
        EXCEPTION WHEN OTHERS THEN 
            RAISE NOTICE 'Could not add fk_fin_treatment_plan. treatment_id types might mismatch or data violation.';
        END;
        
    END IF;

END $$;
