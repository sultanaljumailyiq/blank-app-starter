-- Create Job Seeker Profiles Table
CREATE TABLE IF NOT EXISTS public.job_seeker_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    bio TEXT,
    skills TEXT[],
    experience JSONB DEFAULT '[]'::jsonb,
    education JSONB DEFAULT '[]'::jsonb,
    phone TEXT,
    location TEXT,
    is_looking_for_work BOOLEAN DEFAULT false,
    resume_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.job_seeker_profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.job_seeker_profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.job_seeker_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.job_seeker_profiles FOR UPDATE 
USING (auth.uid() = id);

-- Ensure Job Applications table exists (if not created by previous migrations)
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cover_letter TEXT,
    status TEXT DEFAULT 'pending', -- pending, reviewed, rejected, accepted
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Applications
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Policies for Applications
CREATE POLICY "Applicants can view their own applications" 
ON public.job_applications FOR SELECT 
USING (auth.uid() = applicant_id);

CREATE POLICY "Job owners can view applications for their jobs" 
ON public.job_applications FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.job_postings jp 
        WHERE jp.id = job_applications.job_id 
        AND (jp.clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()) -- Assumes clinic ownership logic
             OR jp.laboratory_id IN (SELECT id FROM dental_laboratories WHERE owner_id = auth.uid()))
    )
);

CREATE POLICY "Users can apply to jobs" 
ON public.job_applications FOR INSERT 
WITH CHECK (auth.uid() = applicant_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_seeker_looking ON public.job_seeker_profiles(is_looking_for_work);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant_id ON public.job_applications(applicant_id);
