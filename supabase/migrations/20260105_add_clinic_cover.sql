-- Add cover_url to clinics table
ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Update RLS if needed (usually existing update policy covers new columns if it's for 'clinics' row)
-- The existing policy "Allow owners and admins to update clinics" should cover this.
