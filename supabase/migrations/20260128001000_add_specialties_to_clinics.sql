-- Add specialties to clinics table
-- Using TEXT[] for array of strings which is clean in Postgres
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}';

-- Index for searching specific specialties (GIN index for array)
CREATE INDEX IF NOT EXISTS idx_clinics_specialties ON public.clinics USING GIN (specialties);
