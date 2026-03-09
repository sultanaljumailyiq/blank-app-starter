-- Add role column to job_seeker_profiles table
ALTER TABLE public.job_seeker_profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'doctor';

-- Optional: Create an enum type if strict validation is needed, 
-- but TEXT is often flexible enough for rapid dev. 
-- Common values will be: 'doctor', 'assistant', 'technician', 'supplier', 'admin'
