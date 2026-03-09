
-- Add supplier_id to financial_transactions if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'financial_transactions' AND column_name = 'supplier_id') THEN
        ALTER TABLE "financial_transactions" ADD COLUMN "supplier_id" uuid REFERENCES "suppliers"("id") ON DELETE SET NULL;
    END IF;
END $$;
