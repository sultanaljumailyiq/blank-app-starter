-- Add lab_id to financial_transactions
ALTER TABLE financial_transactions 
ADD COLUMN IF NOT EXISTS lab_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Create index for lab_id
CREATE INDEX IF NOT EXISTS idx_financial_transactions_lab ON financial_transactions(lab_id);

-- Update RLS policies to allow labs to view/insert their own transactions
-- (Note: Existing policies were 'true' for authenticated, so technically covered, but good to be aware)
