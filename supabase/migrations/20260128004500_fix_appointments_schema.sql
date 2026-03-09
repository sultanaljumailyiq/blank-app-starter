-- Enable RLS on appointments if not already
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Allow public to INSERT into appointments (for Online Booking)
-- We restrict this to status = 'pending' to prevent abuse
CREATE POLICY "Allow public insert for bookings"
ON appointments FOR INSERT
TO anon, authenticated
WITH CHECK ( status = 'pending' );

-- Allow public to SELECT their own appointments?? No, for now we just allow insert.
-- But we need to ensure they can't delete or update.

-- Add phone_number column if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'appointments' AND column_name = 'phone_number') THEN
        ALTER TABLE appointments ADD COLUMN phone_number TEXT;
    END IF;
END $$;

-- Make sure patient_id is nullable (it should be, but just in case)
ALTER TABLE appointments ALTER COLUMN patient_id DROP NOT NULL;

-- Create index for faster queries on status
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments(clinic_id);
