-- Create Job Postings Table
CREATE TABLE IF NOT EXISTS public.job_postings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    governorate TEXT,
    district TEXT,
    category TEXT, -- 'Dentist', 'Assistant', 'Technician', etc.
    type TEXT, -- 'Full-time', 'Part-time'
    salary TEXT,
    experience TEXT, -- 'Entry', '1-3 years', etc.
    description TEXT,
    requirements TEXT[],
    contact_email TEXT,
    contact_phone TEXT,
    sponsorship_level TEXT DEFAULT 'basic', -- 'basic', 'gold', 'premium' (Featured)
    status TEXT DEFAULT 'active', -- 'active', 'expired', 'draft'
    is_featured BOOLEAN DEFAULT false,
    applications_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Job Applications Table
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'shortlisted', 'rejected'
    cv_url TEXT,
    cover_letter TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Policies for Jobs
CREATE POLICY "Public jobs are viewable by everyone" ON public.job_postings
    FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can do everything on jobs" ON public.job_postings
    FOR ALL USING (auth.email() LIKE '%admin%'); -- Replace with proper admin check if available

-- Policies for Applications
CREATE POLICY "Users can view their own applications" ON public.job_applications
    FOR SELECT USING (auth.uid() = applicant_id);

CREATE POLICY "Users can insert their own applications" ON public.job_applications
    FOR INSERT WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Admins can view all applications" ON public.job_applications
    FOR SELECT USING (auth.email() LIKE '%admin%');

-- Insert Seed Data for Jobs
INSERT INTO public.job_postings (title, company_name, governorate, district, category, type, salary, experience, description, sponsorship_level, status, is_featured, created_at)
VALUES
('طبيب أسنان عام', 'عيادة النور التخصصية', 'بغداد', 'المنصور', 'طبيب أسنان عام', 'دوام كامل', '1,500,000 - 2,000,000 د.ع', 'سنتين', 'مطلوب طبيب أسنان عام خبرة لا تقل عن سنتين للعمل في عيادة تخصصية.', 'premium', 'active', true, NOW()),
('مساعد طبيب أسنان', 'مركز البسمة', 'بغداد', 'الكرادة', 'مساعد طبيب أسنان', 'دوام جزئي', '600,000 د.ع', 'سنة', 'مطلوب مساعد/ة طبيب أسنان للعمل في الفترة المسائية.', 'basic', 'active', false, NOW() - INTERVAL '3 days'),
('فني مختبر أسنان', 'مختبر الدقة', 'أربيل', 'عين كاوا', 'فني مختبر', 'دوام كامل', '1,200,000 د.ع', '3 سنوات', 'مختبر أسنان بحاجة إلى فني سيراميك محترف.', 'gold', 'active', true, NOW() - INTERVAL '5 days');
