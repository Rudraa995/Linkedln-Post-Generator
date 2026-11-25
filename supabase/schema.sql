-- Run this in Supabase SQL editor to create tables

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text unique not null,
  full_name text,
  headline text,
  about_me text,
  current_role_title text,
  education text,
  college_university text,
  skills jsonb default '[]'::jsonb,
  work_experience jsonb default '[]'::jsonb,
  internship_experience jsonb default '[]'::jsonb,
  projects jsonb default '[]'::jsonb,
  certifications jsonb default '[]'::jsonb,
  achievements jsonb default '[]'::jsonb,
  professional_interests jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists posts (
  id text primary key,
  user_id text not null,
  topic text,
  post_type text,
  tone text,
  target_audience text,
  length text,
  language text,
  emoji_preference text,
  hashtags_enabled boolean default true,
  use_profile_context boolean default false,
  content text,
  hook text,
  main_content text,
  conclusion text,
  hashtags jsonb default '[]'::jsonb,
  cta text,
  image_url text,
  image_prompt text,
  status text default 'draft',
  scheduled_at text,
  source_url text,
  source_title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists calendar_events (
  id text primary key,
  user_id text not null,
  post_id text,
  title text,
  date text,
  time text,
  status text default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists settings (
  user_id text primary key,
  data jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Disable RLS for simplicity (anon key can read/write). Adjust for production.
alter table profiles disable row level security;
alter table posts disable row level security;
alter table calendar_events disable row level security;
alter table settings disable row level security;
