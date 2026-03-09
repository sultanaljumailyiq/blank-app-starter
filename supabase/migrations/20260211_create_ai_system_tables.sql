-- Create AI Agents Table
CREATE TABLE IF NOT EXISTS public.ai_agents (
    id TEXT PRIMARY KEY, -- 'image_analysis', 'doctor_assistant', 'patient_assistant'
    name TEXT NOT NULL,
    description TEXT,
    provider TEXT NOT NULL, -- 'openai', 'anthropic', 'banana', etc.
    model TEXT NOT NULL, -- 'gpt-4o', 'claude-3-opus', etc.
    api_key TEXT, -- Encrypted or plain (depending on security reqs, plain for now with RLS)
    system_rules TEXT,
    temperature FLOAT DEFAULT 0.5,
    is_active BOOLEAN DEFAULT true,
    cost_per_request FLOAT DEFAULT 0.0,
    capabilities JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;

-- Policies for ai_agents
-- Only Admins (service role or specific admin role) can edit. 
-- For now, allow all authenticated users to VIEW (so the app can load config).
-- Allow public to view 'patient_assistant' only.

CREATE POLICY "Allow authenticated read access"
ON public.ai_agents FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow public read access for patient_assistant"
ON public.ai_agents FOR SELECT
TO anon
USING (id = 'patient_assistant');

-- Allow admins/owners to update (Simplification: Allow authenticated for now to enable settings page for the doctor)
-- Ideally, this should be restricted to clinic owners or admins.
CREATE POLICY "Allow authenticated update access"
ON public.ai_agents FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);


-- Create AI Usage Logs Table
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clinic_id INTEGER REFERENCES public.clinics(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    agent_id TEXT REFERENCES public.ai_agents(id),
    tokens_used INTEGER DEFAULT 0,
    cost FLOAT DEFAULT 0.0,
    request_type TEXT, -- 'text', 'image_analysis', 'image_edit'
    user_type TEXT, -- 'clinic', 'patient', 'guest'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Policies for usage logs
-- Allow insert from authenticated and anon (for guest patients)
CREATE POLICY "Allow insert for everyone"
ON public.ai_usage_logs FOR INSERT
TO public
WITH CHECK (true);

-- Allow viewing logs: Users can view their own clinic's logs.
CREATE POLICY "Allow viewing own clinic logs"
ON public.ai_usage_logs FOR SELECT
TO authenticated
USING (
    clinic_id IN (
        SELECT clinic_id FROM public.clinic_members WHERE user_id = auth.uid()
        UNION
        SELECT id FROM public.clinics WHERE owner_id = auth.uid()
    )
    OR
    user_id = auth.uid()
);


-- Seed Initial Data (Upsert)
INSERT INTO public.ai_agents (id, name, description, provider, model, is_active, temperature, system_rules, capabilities)
VALUES
(
    'image_analysis',
    'محلل الصور الطبية (Medical Image Analyst)',
    'متخصص في تحليل صور الأشعة والصور السريرية للكشف عن التسوسات وأمراض اللثة.',
    'openai',
    'gpt-4o',
    true,
    0.2,
    'You are an expert dental radiologist and oral pathologist. Analyze the provided dental image carefully. Identify any visible pathologies (caries, bone loss, lesions). Provide a structured report.',
    '{"image_analysis": true, "supports_vision": true}'::jsonb
),
(
    'doctor_assistant',
    'المساعد الطبي للطبيب (Doctor Assistant)',
    'مساعد ذكي للطبيب للمساعدة في التشخيص، خطط العلاج، وإدارة العيادة.',
    'anthropic',
    'claude-3-opus',
    true,
    0.7,
    'You are a helpful AI assistant for a dentist. Assist with patient diagnosis based on symptoms and history provided. Suggest treatment plans according to modern dental protocols.',
    '{"text_chat": true, "context_aware": true}'::jsonb
),
(
    'patient_assistant',
    'المساعد الذكي للمريض (Patient Smart Guide)',
    'بوت دردشة للمرضى للإجابة على الأسئلة العامة وحجز المواعيد.',
    'openai',
    'gpt-3.5-turbo',
    true,
    0.5,
    'You are a friendly and empathetic dental health guide for patients. Answer questions about dental hygiene and procedures in simple language. Do NOT provide specific medical diagnosis.',
    '{"text_chat": true, "public_access": true}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    system_rules = EXCLUDED.system_rules;
