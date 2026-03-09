-- ==============================================================================
-- JOBS SCHEMA (Fixed)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id INTEGER REFERENCES clinics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    salary_range TEXT,
    type TEXT DEFAULT 'full_time', -- 'full_time', 'part_time'
    location TEXT,
    status TEXT DEFAULT 'open', -- 'open', 'closed'
    posted_date TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read jobs" ON jobs;
CREATE POLICY "Public read jobs" ON jobs FOR SELECT USING (status = 'open');

DROP POLICY IF EXISTS "Clinics manage jobs" ON jobs;
CREATE POLICY "Clinics manage jobs" ON jobs FOR ALL USING (clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid()));

CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    resume_url TEXT,
    cover_letter TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'interview', 'rejected', 'hired'
    applied_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clinics view applications" ON job_applications;
CREATE POLICY "Clinics view applications" ON job_applications FOR SELECT USING (job_id IN (SELECT id FROM jobs WHERE clinic_id IN (SELECT id FROM clinics WHERE owner_id = auth.uid())));

DROP POLICY IF EXISTS "Users view own applications" ON job_applications;
CREATE POLICY "Users view own applications" ON job_applications FOR SELECT USING (applicant_id = auth.uid());

DROP POLICY IF EXISTS "Users create applications" ON job_applications;
CREATE POLICY "Users create applications" ON job_applications FOR INSERT WITH CHECK (applicant_id = auth.uid());

CREATE TABLE IF NOT EXISTS job_seeker_profiles (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT,
    bio TEXT,
    skills TEXT[],
    experience JSONB DEFAULT '[]',
    education JSONB DEFAULT '[]',
    phone TEXT,
    location TEXT,
    role TEXT,
    is_looking_for_work BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE job_seeker_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read seekers" ON job_seeker_profiles;
CREATE POLICY "Public read seekers" ON job_seeker_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage own seeker profile" ON job_seeker_profiles;
CREATE POLICY "Users manage own seeker profile" ON job_seeker_profiles FOR ALL USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS job_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES profiles(id),
    receiver_id UUID REFERENCES job_seeker_profiles(id),
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    job_title TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view received offers" ON job_offers;
CREATE POLICY "Users view received offers" ON job_offers FOR SELECT USING (receiver_id = auth.uid());

DROP POLICY IF EXISTS "Users view sent offers" ON job_offers;
CREATE POLICY "Users view sent offers" ON job_offers FOR SELECT USING (sender_id = auth.uid());

DROP POLICY IF EXISTS "Users create offers" ON job_offers;
CREATE POLICY "Users create offers" ON job_offers FOR INSERT WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "Users update received offers" ON job_offers;
CREATE POLICY "Users update received offers" ON job_offers FOR UPDATE USING (receiver_id = auth.uid());
