-- Fix Clinics Table: Add missing cover_url
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Fix Notifications Table: Add clinic_id for Clinic-level notifications
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS clinic_id BIGINT REFERENCES public.clinics(id) ON DELETE CASCADE;

-- Add Index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_clinic_id ON public.notifications(clinic_id);
