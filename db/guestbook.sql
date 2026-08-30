create extension if not exists pgcrypto;

create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  display_name varchar(40) not null check (char_length(trim(display_name)) between 1 and 40),
  message varchar(280) not null check (char_length(trim(message)) between 1 and 280),
  created_at timestamptz not null default now(),
  moderation_state text not null default 'visible' check (moderation_state in ('visible', 'hidden')),
  submitter_hash char(64) not null
);

create index if not exists guestbook_entries_visible_created_idx
  on public.guestbook_entries (created_at desc)
  where moderation_state = 'visible';

create index if not exists guestbook_entries_submitter_created_idx
  on public.guestbook_entries (submitter_hash, created_at desc);

alter table public.guestbook_entries enable row level security;

-- No anon/authenticated policies are created. Public reads and writes go through
-- the server route, which uses SUPABASE_SERVICE_ROLE_KEY. Moderation remains
-- available from the Supabase dashboard by setting moderation_state = 'hidden'.
