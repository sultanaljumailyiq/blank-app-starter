-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. General & Admin Center
-- ==========================================

-- Admin Settings (Platform configurations)
create table public.admin_settings (
    id uuid primary key default uuid_generate_v4(),
    key text unique not null,
    value jsonb not null,
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Subscription Plans
create table public.subscription_plans (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    price numeric not null,
    duration_months integer not null default 1,
    features jsonb not null, -- Stores list of features
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Doctor Subscription Requests
create table public.subscription_requests (
    id uuid primary key default uuid_generate_v4(),
    doctor_id uuid references auth.users not null, -- Assuming auth.users handles auth
    plan_id uuid references public.subscription_plans not null,
    status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
    payment_proof_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Discount Coupons
create table public.coupons (
    id uuid primary key default uuid_generate_v4(),
    code text unique not null,
    discount_amount numeric not null,
    discount_type text check (discount_type in ('percentage', 'fixed')) default 'percentage',
    valid_until timestamp with time zone,
    usage_limit integer,
    used_count integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Support Tickets (Unified for all users: Doctor, Lab, Supplier)
create table public.support_tickets (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users not null,
    subject text not null,
    message text not null,
    category text,
    status text check (status in ('open', 'in_progress', 'resolved', 'closed')) default 'open',
    priority text check (priority in ('low', 'medium', 'high')) default 'medium',
    admin_response text,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Support Ticket Messages (Thread)
create table public.support_ticket_messages (
    id uuid primary key default uuid_generate_v4(),
    ticket_id uuid references public.support_tickets(id) on delete cascade not null,
    sender_id uuid references auth.users not null,
    message text not null,
    is_admin boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Notifications
create table public.notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users not null,
    title text not null,
    message text not null,
    type text check (type in ('info', 'warning', 'success', 'error')) default 'info',
    read boolean default false,
    action_url text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- 2. Laboratory Center
-- ==========================================

-- Laboratory Profiles
create table public.labs (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users unique not null, -- One lab per user
    name text not null,
    license_number text,
    phone text,
    address text,
    governorate text,
    city text,
    logo_url text,
    is_verified boolean default false,
    is_active boolean default true,
    rating numeric default 0,
    wallet_balance numeric default 0,
    commission_rate numeric default 10.0, -- Default 10%
    working_hours jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Lab Services (Price List)
create table public.lab_services (
    id uuid primary key default uuid_generate_v4(),
    lab_id uuid references public.labs(id) on delete cascade not null,
    name text not null,
    category text,
    price numeric not null,
    duration_days integer,
    description text,
    is_active boolean default true
);

-- Lab Requests (Custom requests from clinics)
create table public.lab_requests (
    id uuid primary key default uuid_generate_v4(),
    lab_id uuid references public.labs(id) not null,
    doctor_id uuid references auth.users not null,
    patient_name text not null,
    type text not null,
    notes text,
    status text check (status in ('pending', 'accepted', 'rejected')) default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Lab Orders (Actual work orders)
create table public.lab_orders (
    id uuid primary key default uuid_generate_v4(),
    lab_id uuid references public.labs(id) not null,
    doctor_id uuid references auth.users not null,
    patient_name text not null,
    service_id uuid references public.lab_services(id), -- Optional if custom service
    status text check (status in ('new', 'received', 'in_progress', 'ready', 'delivered', 'cancelled')) default 'new',
    price numeric not null,
    notes text,
    delivery_date date,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- 3. Supplier Center & Medical Store
-- ==========================================

-- Supplier Profiles
create table public.suppliers (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users unique not null,
    name text not null,
    description text,
    license_number text,
    phone text,
    logo_url text,
    governorate text,
    city text,
    is_verified boolean default false,
    is_active boolean default true,
    rating numeric default 0,
    wallet_balance numeric default 0,
    commission_rate numeric default 10.0,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Products
create table public.products (
    id uuid primary key default uuid_generate_v4(),
    supplier_id uuid references public.suppliers(id) on delete cascade not null,
    name text not null,
    category text not null,
    description text,
    price numeric not null,
    original_price numeric, -- For discounts
    stock integer default 0,
    images text[], -- Array of image URLs
    brand text,
    rating numeric default 0,
    reviews_count integer default 0,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Buyer Addresses (Clinics/Users addresses)
create table public.addresses (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users not null,
    name text not null, -- e.g., "Clinic", "Home"
    governorate text not null,
    city text not null,
    street text,
    phone text not null,
    is_default boolean default false
);

-- Store Orders (Buyer Purchase)
create table public.orders (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users not null, -- Buyer
    supplier_id uuid references public.suppliers(id) not null, -- Split orders by supplier usually
    address_id uuid references public.addresses(id),
    total_amount numeric not null,
    status text check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) default 'pending',
    payment_status text check (payment_status in ('pending', 'paid', 'failed')) default 'pending',
    tracking_number text,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Order Items
create table public.order_items (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid references public.orders(id) on delete cascade not null,
    product_id uuid references public.products(id) not null,
    quantity integer not null,
    price_at_purchase numeric not null, -- Snapshot of price
    total numeric generated always as (quantity * price_at_purchase) stored
);

-- ==========================================
-- 4. Jobs Center
-- ==========================================

-- Jobs
create table public.jobs (
    id uuid primary key default uuid_generate_v4(),
    poster_id uuid references auth.users not null, -- Clinic or Lab or Supplier
    title text not null,
    description text not null,
    requirements text[],
    type text not null, -- Full-time, Part-time
    salary_range text,
    location text not null,
    governorate text,
    category text,
    is_active boolean default true,
    is_featured boolean default false,
    views_count integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    expires_at timestamp with time zone
);

-- Job Applications
create table public.job_applications (
    id uuid primary key default uuid_generate_v4(),
    job_id uuid references public.jobs(id) on delete cascade not null,
    applicant_id uuid references auth.users not null,
    cv_url text, -- Link to CV file
    cover_letter text,
    status text check (status in ('pending', 'reviewing', 'shortlisted', 'accepted', 'rejected')) default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================
-- 5. Row Level Security (RLS) Policies (Examples)
-- ==========================================

-- Enable RLS on all tables
alter table public.admin_settings enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.labs enable row level security;
alter table public.suppliers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.jobs enable row level security;
-- ... repeat for all tables

-- Example Policies:

-- PRODUCTS: Visible to everyone, Editable only by owner (Supplier)
create policy "Products are viewable by everyone" on public.products
  for select using (true);

create policy "Suppliers can insert their own products" on public.products
  for insert with check (auth.uid() in (select user_id from public.suppliers where id = supplier_id));

create policy "Suppliers can update their own products" on public.products
  for update using (auth.uid() in (select user_id from public.suppliers where id = supplier_id));

create policy "Suppliers can delete their own products" on public.products
  for delete using (auth.uid() in (select user_id from public.suppliers where id = supplier_id));

-- JOBS: Visible to everyone, Editable only by poster
create policy "Jobs are viewable by everyone" on public.jobs
  for select using (true);

create policy "Users can post jobs" on public.jobs
  for insert with check (auth.uid() = poster_id);

-- ORDERS: Visible only to Buyer and Supplier (Owner)
create policy "Buyers can view their own orders" on public.orders
  for select using (auth.uid() = user_id);

create policy "Suppliers can view orders assigned to them" on public.orders
  for select using (auth.uid() in (select user_id from public.suppliers where id = supplier_id));

-- Add more policies as needed for security hardening.
