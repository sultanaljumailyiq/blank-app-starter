-- Update status check constraint to include 'pending'
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show', 'pending', 'confirmed'));

-- Update payment status check constraint (optional but good practice)
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_payment_status_check;
ALTER TABLE appointments ADD CONSTRAINT appointments_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'partial'));

-- Allow public (anon) access to insert appointments with status 'pending'
CREATE POLICY "Allow public to create pending appointments"
  ON appointments FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');

-- Allow public to select their own appointments (optional, e.g. via ID/Phone lookup later)
-- For now, just insert is critical.
