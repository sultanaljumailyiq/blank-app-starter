-- Notifications Table
create table if not exists "notifications" (
    "id" uuid primary key default gen_random_uuid(),
    "user_id" uuid not null references auth.users(id) on delete cascade, -- Recipient
    "actor_id" uuid references auth.users(id) on delete set null, -- Who triggered it (e.g., liker)
    "type" text not null, -- 'like', 'comment', 'follow', 'message', 'reply', 'course_new', 'webinar_new', 'group_approve', 'group_request'
    "title" text,
    "content" text,
    "link" text, -- Internal link (e.g., /community/post/123)
    "is_read" boolean default false,
    "related_id" text, -- ID of the related entity (postId, courseId, etc.)
    "created_at" timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fetching notifications
create index idx_notifications_user_id on notifications(user_id);
create index idx_notifications_created_at on notifications(created_at);

-- Group Members Enhancement (if not fully defined already)
-- Ensure group_members has role
create table if not exists "group_members" (
    "group_id" uuid references "groups"(id) on delete cascade,
    "user_id" uuid references auth.users(id) on delete cascade,
    "role" text default 'member', -- 'admin', 'moderator', 'member'
    "joined_at" timestamp with time zone default timezone('utc'::text, now()),
    primary key ("group_id", "user_id")
);

-- Group Join Requests
create table if not exists "group_requests" (
    "id" uuid primary key default gen_random_uuid(),
    "group_id" uuid references "groups"(id) on delete cascade,
    "user_id" uuid references auth.users(id) on delete cascade,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "status" text default 'pending', -- pending, approved, rejected
    unique("group_id", "user_id")
);

-- RLS Policies (Basic)
alter table notifications enable row level security;
create policy "Users can view their own notifications" on notifications
    for select using (auth.uid() = user_id);

create policy "System can insert notifications" on notifications
    for insert with check (true); -- Ideally restricted, but open for now for app logic
    
create policy "Users can update their own notifications" on notifications
    for update using (auth.uid() = user_id);

-- Groups: Allow everything for now for demo purposes, restrict in prod
alter table group_members enable row level security;
create policy "Public read members" on group_members for select using (true);
create policy "Authenticated insert members" on group_members for insert with check (auth.uid() = user_id);
create policy "Admins can update members" on group_members for update using (
    exists (
        select 1 from group_members gm
        where gm.group_id = group_members.group_id
        and gm.user_id = auth.uid()
        and gm.role in ('admin', 'moderator')
    )
);

-- Triggers for Notifications (Optional but good for robust data)
-- For now, we will handle logic in the application layer (Context) to ensure text/descriptions are localized/formatted correctly.
