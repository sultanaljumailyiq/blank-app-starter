-- ==========================================
-- DOCTOR HUB SCHEMA & RLS POLICIES
-- ==========================================

-- 1. Clinics Table
create table public.clinics (
    id uuid primary key default uuid_generate_v4(),
    owner_id uuid references auth.users not null,
    name text not null,
    phone text,
    address text,
    city text,
    governorate text,
    logo_url text,
    cover_image_url text,
    description text,
    specialties text[], -- Array of strings
    services text[],    -- Array of strings
    working_hours jsonb,
    is_active boolean default true,
    is_verified boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Clinic Staff Table
create table public.staff (
    id uuid primary key default uuid_generate_v4(),
    clinic_id uuid references public.clinics(id) on delete cascade not null,
    user_id uuid references auth.users, -- Optional: if staff has a login
    full_name text not null,
    role text check (role in ('doctor', 'dentist', 'assistant', 'receptionist', 'nurse', 'technician', 'manager')) not null,
    email text,
    phone text,
    permissions jsonb, -- { "can_manage_settings": true, ... }
    is_active boolean default true,
    joined_at date default CURRENT_DATE,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Patients Table
create table public.patients (
    id uuid primary key default uuid_generate_v4(),
    clinic_id uuid references public.clinics(id) on delete cascade not null,
    full_name text not null,
    phone text,
    date_of_birth date,
    gender text check (gender in ('male', 'female')),
    address text,
    medical_history jsonb, -- { "allergies": [], "conditions": [] }
    teeth_condition jsonb, -- 3D Model or Chart data
    last_visit_at timestamp with time zone,
    total_visits integer default 0,
    balance numeric default 0,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Appointments Table
create table public.appointments (
    id uuid primary key default uuid_generate_v4(),
    clinic_id uuid references public.clinics(id) on delete cascade not null,
    patient_id uuid references public.patients(id) on delete cascade not null,
    doctor_id uuid references public.staff(id), -- Assigned Doctor
    date date not null,
    time time not null,
    duration_minutes integer default 30,
    type text not null, -- 'consultation', 'checkup', etc.
    status text check (status in ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')) default 'pending',
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Treatments / Procedures Table
create table public.treatments (
    id uuid primary key default uuid_generate_v4(),
    clinic_id uuid references public.clinics(id) on delete cascade not null,
    patient_id uuid references public.patients(id) on delete cascade not null,
    appointment_id uuid references public.appointments(id),
    doctor_id uuid references public.staff(id),
    procedure_name text not null,
    description text,
    cost numeric default 0,
    paid_amount numeric default 0,
    status text check (status in ('planned', 'in_progress', 'completed')) default 'planned',
    tooth_number integer, -- Optional: for dental specific
    date date default CURRENT_DATE,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS
alter table public.clinics enable row level security;
alter table public.staff enable row level security;
alter table public.patients enable row level security;
alter table public.appointments enable row level security;
alter table public.treatments enable row level security;

-- Helper Function: Get User's Clinics (Owner OR Staff)
create or replace function get_my_clinic_ids()
returns setof uuid as $$
begin
  return query
  select id from public.clinics where owner_id = auth.uid()
  union
  select clinic_id from public.staff where user_id = auth.uid() and is_active = true;
end;
$$ language plpgsql security definer;

-- ------------------------------------------
-- 1. CLINICS POLICIES
-- ------------------------------------------
create policy "Users can view their own clinics" on public.clinics
  for select using (
    owner_id = auth.uid() 
    or id in (select get_my_clinic_ids())
  );

create policy "Owners can update their clinics" on public.clinics
  for update using (owner_id = auth.uid());

create policy "Owners can insert clinics" on public.clinics
  for insert with check (owner_id = auth.uid());

-- ------------------------------------------
-- 2. STAFF POLICIES
-- ------------------------------------------
create policy "Users can view staff in their clinics" on public.staff
  for select using (clinic_id in (select get_my_clinic_ids()));

create policy "Owners and Admins can manage staff" on public.staff
  for all using (
    clinic_id in (select id from public.clinics where owner_id = auth.uid())
    -- Add granular permission check here later if needed (e.g. Manager Staff)
  );

-- ------------------------------------------
-- 3. PATIENTS POLICIES
-- ------------------------------------------
create policy "Users can view patients in their clinics" on public.patients
  for select using (clinic_id in (select get_my_clinic_ids()));

create policy "Staff can insert/update patients" on public.patients
  for all using (clinic_id in (select get_my_clinic_ids()));

-- ------------------------------------------
-- 4. APPOINTMENTS POLICIES
-- ------------------------------------------
create policy "Users can view appointments in their clinics" on public.appointments
  for select using (clinic_id in (select get_my_clinic_ids()));

create policy "Staff can manage appointments" on public.appointments
  for all using (clinic_id in (select get_my_clinic_ids()));

-- ------------------------------------------
-- 5. TREATMENTS POLICIES
-- ------------------------------------------
create policy "Users can view treatments in their clinics" on public.treatments
  for select using (clinic_id in (select get_my_clinic_ids()));

create policy "Staff can manage treatments" on public.treatments
  for all using (clinic_id in (select get_my_clinic_ids()));
