-- ==============================================================================
-- LelisaCV Builder - Supabase Database Schema & Row Level Security (RLS)
-- Copy and paste this script into your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Create Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  email text,
  phone text,
  location text,
  headline text,
  linkedin text,
  github text,
  portfolio text,
  bio text,
  education jsonb default '[]'::jsonb,
  experience jsonb default '[]'::jsonb,
  skills jsonb default '[]'::jsonb,
  projects jsonb default '[]'::jsonb,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 2. Create Saved CVs Table
create table if not exists public.saved_cvs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null default 'My Professional CV',
  template_id text not null default 'corporate-navy',
  singleton_data jsonb default '{}'::jsonb,
  entries_data jsonb default '{}'::jsonb,
  style_overrides jsonb default '{}'::jsonb,
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Saved CVs
alter table public.saved_cvs enable row level security;

-- Saved CVs Policies
create policy "Users can view their own saved CVs"
  on public.saved_cvs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own saved CVs"
  on public.saved_cvs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own saved CVs"
  on public.saved_cvs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own saved CVs"
  on public.saved_cvs for delete
  using (auth.uid() = user_id);

-- 3. Create Saved Letters Table
create table if not exists public.saved_letters (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  company text,
  position text,
  letter_type text default 'application',
  language text default 'en',
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Saved Letters
alter table public.saved_letters enable row level security;

-- Saved Letters Policies
create policy "Users can view their own saved letters"
  on public.saved_letters for select
  using (auth.uid() = user_id);

create policy "Users can insert their own saved letters"
  on public.saved_letters for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own saved letters"
  on public.saved_letters for delete
  using (auth.uid() = user_id);

-- 4. Trigger to automatically create a profile when a new user signs up via Email or OAuth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if already exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
