-- supabase/schema.sql
-- Run this once in the Supabase SQL editor (or via `supabase db push`)
-- for a new project before deploying.

create table if not exists journals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date text not null,
  raw_message text not null,
  journal text not null,
  mood text not null,
  energy integer not null check (energy >= 1 and energy <= 10),
  highlights jsonb not null default '[]'::jsonb,
  reflection text not null default '',
  tags jsonb not null default '[]'::jsonb,
  companion_reply text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migration for a database that already has the `journals` table from
-- before the companion reply feature existed. Safe to re-run.
alter table journals add column if not exists companion_reply text not null default '';

create index if not exists journals_user_id_created_at_idx
  on journals (user_id, created_at desc);

-- Row Level Security — every user can only ever see or touch their own rows.
alter table journals enable row level security;

create policy "Users can view their own journals"
  on journals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own journals"
  on journals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own journals"
  on journals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own journals"
  on journals for delete
  using (auth.uid() = user_id);

-- Keep updated_at current on every edit.
create or replace function set_journals_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists journals_set_updated_at on journals;
create trigger journals_set_updated_at
  before update on journals
  for each row
  execute function set_journals_updated_at();