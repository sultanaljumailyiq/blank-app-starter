-- Support Tickets Table
create table if not exists support_tickets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  title text not null,
  description text,
  status text default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  priority text default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Ticket Messages Table
create table if not exists ticket_messages (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references support_tickets(id) on delete cascade,
  sender_id uuid references auth.users(id),
  message text not null,
  is_support_reply boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- System Updates Table
create table if not exists system_updates (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  version text not null,
  type text check (type in ('major', 'minor', 'patch', 'security')),
  content text,
  is_published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add is_banned to profiles if not exists (assuming profiles table exists)
-- This is a safe check, dependent on existing schema
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'is_banned') then
    alter table profiles add column is_banned boolean default false;
  end if;
end $$;
