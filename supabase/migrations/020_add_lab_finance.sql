-- Add lab_id to financial_transactions
ALTER TABLE financial_transactions
ADD COLUMN IF NOT EXISTS lab_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Update RLS for Lab Finance
CREATE POLICY "Labs can manage their own transactions"
ON financial_transactions FOR ALL
USING (
  lab_id = auth.uid()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_financial_transactions_lab ON financial_transactions(lab_id);
