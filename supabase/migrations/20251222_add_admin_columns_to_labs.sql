-- Add Admin Control Columns to dental_laboratories
ALTER TABLE dental_laboratories 
ADD COLUMN IF NOT EXISTS commission_percentage DECIMAL(5, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'pending', 'suspended')),
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS total_revenue DECIMAL(15, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS pending_commission DECIMAL(15, 2) DEFAULT 0.00;

-- Index for status
CREATE INDEX IF NOT EXISTS idx_dental_laboratories_status ON dental_laboratories(account_status);
