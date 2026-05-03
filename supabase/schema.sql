-- Run this in the Supabase SQL Editor (Dashboard -> SQL).

-- Allowlist: only these emails can add/edit prompts.
create table if not exists allowed_authors (
  email text primary key,
  added_at timestamptz not null default now()
);

create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 1 and 200),
  body text not null check (length(body) between 1 and 20000),
  tags text[] not null default '{}',
  author_id uuid not null references auth.users(id) on delete cascade,
  author_email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists prompts_tags_idx on prompts using gin(tags);
create index if not exists prompts_created_idx on prompts(created_at desc);
create index if not exists prompts_author_idx on prompts(author_id);

create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end $$ language plpgsql;

drop trigger if exists prompts_set_updated_at on prompts;
create trigger prompts_set_updated_at before update on prompts
  for each row execute function set_updated_at();

alter table prompts enable row level security;
alter table allowed_authors enable row level security;

-- Anyone (even anonymous visitors) can read prompts.
drop policy if exists "public read prompts" on prompts;
create policy "public read prompts" on prompts for select using (true);

-- Only allowlisted emails can insert, and only as themselves.
drop policy if exists "allowed insert prompts" on prompts;
create policy "allowed insert prompts" on prompts for insert
  with check (
    auth.uid() = author_id
    and lower(author_email) = lower(auth.jwt() ->> 'email')
    and exists (
      select 1 from allowed_authors
      where lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

-- Authors can edit/delete their own prompts.
drop policy if exists "author update own" on prompts;
create policy "author update own" on prompts for update using (auth.uid() = author_id);

drop policy if exists "author delete own" on prompts;
create policy "author delete own" on prompts for delete using (auth.uid() = author_id);

-- Logged-in users can check the allowlist (used by the UI to show "Add" button).
drop policy if exists "auth read allowlist" on allowed_authors;
create policy "auth read allowlist" on allowed_authors for select
  using (auth.role() = 'authenticated');

-- Seed: add yourself + friends here, or insert later from the SQL editor.
-- insert into allowed_authors (email) values ('alfathariz@gmail.com') on conflict do nothing;
