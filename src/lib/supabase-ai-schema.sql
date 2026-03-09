-- AI AGENTS & CONFIGURATION
create table if not exists public.ai_agents (
  id text primary key, -- 'image_analysis', 'doctor_assistant', etc.
  name text not null,
  description text,
  provider text not null, -- 'openai', 'anthropic', 'google', 'deepseek'
  model text not null,
  is_active boolean default true,
  temperature numeric(3,2) default 0.7,
  system_rules text,
  capabilities jsonb default '[]',
  api_key text, -- Stored locally/securely, but schema supports it if needed.
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- AI USAGE LOGS
create table if not exists public.ai_usage_logs (
  id uuid default uuid_generate_v4() primary key,
  agent_id text references public.ai_agents(id),
  user_id uuid references public.profiles(id),
  clinic_id uuid references public.clinics(id),
  tokens_used integer default 0,
  request_type text, -- 'image_analysis', 'chat', etc.
  user_type text, -- 'clinic', 'patient', 'guest'
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS POLICIES
alter table public.ai_agents enable row level security;
alter table public.ai_usage_logs enable row level security;

-- Drop existing policies to allow clean re-runs
drop policy if exists "Admins can manage ai_agents" on public.ai_agents;
drop policy if exists "Users can read active agents" on public.ai_agents;
drop policy if exists "Users can insert usage logs" on public.ai_usage_logs;
drop policy if exists "Admins can view all logs" on public.ai_usage_logs;
drop policy if exists "Guests can insert usage logs" on public.ai_usage_logs;

-- Allow Admins to manage agents
create policy "Admins can manage ai_agents" on public.ai_agents
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Allow authenticated users to read public agent info (if needed) or just backend?
-- For now, let's allow read for all authenticated users to be safe for the app usage
create policy "Users can read active agents" on public.ai_agents
  for select using (true); 

-- USAGE LOGS
create policy "Users can insert usage logs" on public.ai_usage_logs
  for insert with check (auth.uid() = user_id);

-- Allow guests to insert usage logs (for Visitor Stats)
create policy "Guests can insert usage logs" on public.ai_usage_logs
  for insert with check (user_type = 'guest');

create policy "Admins can view all logs" on public.ai_usage_logs
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- SEED DATA (Default Configurations)
INSERT INTO public.ai_agents (id, name, description, provider, model, is_active, temperature, system_rules) VALUES
('image_analysis', 'محلل الصور الطبية (Medical Image Analyst)', 'متخصص في تحليل صور الأشعة والصور السريرية للكشف عن التسوسات وأمراض اللثة.', 'openai', 'gpt-4o', true, 0.2, 'You are an expert dental radiologist and oral pathologist.\n1. Analyze the provided dental image carefully.\n2. Identify any visible pathologies (caries, bone loss, lesions).\n3. Provide a structured report with: Findings, Diagnosis, Severity (Low/Medium/High), and Recommendations.\n4. If the image is unclear, requested a retake.\n5. Always be professional and concise.'),
('doctor_assistant', 'المساعد السريري (Clinical Assistant)', 'مساعد ذكي للأطباء للمساعدة في التشخيص وكتابة التقارير واقتراح الخطط العلاجية.', 'anthropic', 'claude-3-5-sonnet-20240620', true, 0.7, 'You are a senior dental consultant assisting a dentist.\n1. Provide evidence-based advice for diagnosis and treatment planning.\n2. When asked about medications, verify patient history (if provided) for allergies.\n3. Keep responses concise and clinically relevant.\n4. Support English and Arabic queries perfectly.'),
('patient_assistant', 'المساعد الذكي للمرضى (Patient Care)', 'بوت دردشة للمرضى للإجابة على الاستفسارات العامة وحجز المواعيد.', 'openai', 'gpt-4o-mini', true, 0.8, 'You are a friendly and empathetic dental clinic receptionist/assistant.\n1. Global Context: You work for "Smart Dental Platform".\n2. Answer patient questions about dental procedures simply.\n3. If they ask for medical advice, give general info but strictly advise visiting a doctor.\n4. Help with appointment scheduling information.\n5. Be polite and welcoming in Arabic.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  provider = EXCLUDED.provider,
  model = EXCLUDED.model,
  system_rules = EXCLUDED.system_rules;
