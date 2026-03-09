-- Add governorate and city columns to clinics table
ALTER TABLE clinics 
ADD COLUMN IF NOT EXISTS governorate TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;

-- Verify columns were added (Optional comment)
COMMENT ON COLUMN clinics.governorate IS 'The governorate/province of the clinic';
COMMENT ON COLUMN clinics.city IS 'The city/district of the clinic';
