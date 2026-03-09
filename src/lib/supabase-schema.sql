-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES & USERS (Base Layer)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('doctor', 'staff', 'admin', 'supplier', 'lab', 'patient')),
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. CLINICS
create table public.clinics (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id),
  name text not null,
  address text,
  phone text,
  logo_url text,
  is_verified boolean default false,
  subscription_tier text default 'free', -- free, basic, premium
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.clinic_staff (
  id uuid default uuid_generate_v4() primary key,
  clinic_id uuid references public.clinics(id) on delete cascade,
  user_id uuid references public.profiles(id),
  role text, -- 'dentist', 'assistant', 'receptionist'
  permissions jsonb default '{}'
);

-- 3. PATIENTS
create table public.patients (
  id uuid default uuid_generate_v4() primary key,
  clinic_id uuid references public.clinics(id),
  full_name text not null,
  phone text,
  dob date,
  gender text,
  medical_history jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. APPOINTMENTS
create table public.appointments (
  id uuid default uuid_generate_v4() primary key,
  clinic_id uuid references public.clinics(id),
  doctor_id uuid references public.profiles(id),
  patient_id uuid references public.patients(id),
  date date not null,
  start_time time not null,
  end_time time not null,
  status text check (status in ('scheduled', 'confirmed', 'completed', 'cancelled', 'noshow')),
  type text, -- 'consultation', 'treatment', etc.
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. SUPPLIERS & STORE
create table public.suppliers (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id),
  company_name text not null,
  description text,
  license_number text,
  is_verified boolean default false,
  commission_rate numeric(4,2) default 10.00,
  logo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table public.products (
  id uuid default uuid_generate_v4() primary key,
  supplier_id uuid references public.suppliers(id),
  name text not null,
  description text,
  price numeric(10,2) not null,
  category text,
  stock_quantity integer default 0,
  images text[], -- Array of image URLs
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  buyer_id uuid references public.profiles(id), -- Clinic or Doctor
  supplier_id uuid references public.suppliers(id),
  status text check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount numeric(10,2) not null,
  shipping_address jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  quantity integer not null,
  price_at_time numeric(10,2) not null
);

-- 6. LABORATORIES
create table public.labs (
  id uuid default uuid_generate_v4() primary key,
  profile_id uuid references public.profiles(id),
  lab_name text not null,
  services jsonb, -- List of services and prices
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table public.lab_requests (
  id uuid default uuid_generate_v4() primary key,
  clinic_id uuid references public.clinics(id),
  lab_id uuid references public.labs(id),
  patient_name text,
  service_type text,
  status text default 'pending', -- pending, accepted, in_progress, completed, delivered
  notes text,
  due_date date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 7. JOBS
create table public.jobs (
  id uuid default uuid_generate_v4() primary key,
  poster_id uuid references public.profiles(id), -- Specific person or linked entity in future
  title text not null,
  description text,
  requirements text[],
  location text,
  salary_range jsonb, -- {min, max, currency}
  job_type text, -- full-time, part-time
  status text default 'open',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table public.job_applications (
  id uuid default uuid_generate_v4() primary key,
  job_id uuid references public.jobs(id) on delete cascade,
  applicant_id uuid references public.profiles(id),
  cover_letter text,
  cv_url text,
  status text default 'submitted',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS POLICIES (Simplified Draft)
alter table public.profiles enable row level security;
alter table public.clinics enable row level security;
-- ... (Policies to be added in implementation phase)
