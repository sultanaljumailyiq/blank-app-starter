-- Add is_settled column to subscription_requests
ALTER TABLE subscription_requests 
ADD COLUMN IF NOT EXISTS is_settled BOOLEAN DEFAULT FALSE;

-- Create index for faster searching on payment_details
CREATE INDEX IF NOT EXISTS idx_subscription_requests_payment_details 
ON subscription_requests USING gin (payment_details);
