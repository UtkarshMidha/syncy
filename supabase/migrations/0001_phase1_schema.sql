-- Syncy — Phase 1 schema (Supabase / Postgres)
-- Supabase is the source of truth. Notion / notes-app sync is Phase 2 (see docs/DATA_MODEL.md §5);
-- the external_* columns are reserved for it and stay empty in Phase 1.
-- The frontend mirror of these rows lives in prototype/data.js (same table and column names).

create extension if not exists pgcrypto;

-- ---------- enums ----------
create type contact_source  as enum ('qr_linkedin', 'qr_xing', 'qr_other', 'manual');
create type note_kind       as enum ('text', 'voice');
-- Where the row is in the capture pipeline.
create type contact_status  as enum ('captured', 'processing', 'review', 'saved', 'error');
-- Where the relationship is (managed in the dashboard).
create type follow_up_stage as enum ('to_follow_up', 'followed_up', 'meeting_set', 'won', 'not_relevant');

-- ---------- shared updated_at trigger ----------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- events ----------
-- A networking event the user "enters" before scanning.
create table events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  name        text not null check (length(name) between 1 and 120),
  location    text,
  url         text check (url is null or url ~* '^https?://'),  -- event page (Meetup, Luma, Eventbrite …)
  starts_on   date not null default current_date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index events_user_date on events (user_id, starts_on desc);
create trigger events_updated before update on events for each row execute function set_updated_at();

-- ---------- projects ----------
-- The user's own projects / goals. Contacts are matched against name + description.
-- Phase 1: typed in the app. Phase 2: imported and kept in sync from Notion or another notes app.
create table projects (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null default auth.uid() references auth.users on delete cascade,
  name                 text not null check (length(name) between 1 and 120),
  description          text not null default '',   -- what the AI compares a contact against
  emoji                text,
  archived             boolean not null default false,
  -- Phase 2 sync (empty in Phase 1)
  external_source      text check (external_source in ('notion', 'google_docs', 'obsidian', 'apple_notes')),
  external_id          text,                       -- e.g. Notion page id
  external_updated_at  timestamptz,                -- source's last_edited_time, for change detection
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (user_id, external_source, external_id)
);
create index projects_user on projects (user_id) where not archived;
create trigger projects_updated before update on projects for each row execute function set_updated_at();

-- ---------- contacts ----------
create table contacts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users on delete cascade,
  event_id         uuid references events on delete set null,
  project_id       uuid references projects on delete set null,

  -- 1. Scan (saved immediately, before any note)
  source           contact_source not null,
  profile_url      text not null,
  profile_slug     text,                -- 'lena-hoffmann-demo' from linkedin.com/in/lena-hoffmann-demo
  name             text,                -- derived from the slug, editable
  role             text,
  company          text,
  scanned_at       timestamptz not null default now(),

  -- 2. Note (typed or voice)
  note_kind        note_kind,
  note_text        text,                -- the typed note, or the transcript of the voice memo
  audio_path       text,                -- Legacy Storage object path; new voice memos are not stored

  -- 3. AI output (every field editable in review and in the dashboard)
  summary          text,
  discussed        text[] not null default '{}' check (coalesce(array_length(discussed, 1), 0) <= 3),
  needs            text,
  match_reason     text,                -- quotes the note
  match_confidence text check (match_confidence in ('high', 'medium', 'low')),
  project_set_by   text check (project_set_by in ('ai', 'user')),
  next_step        text,
  next_step_date   date,
  follow_up_draft  text,

  -- 4. Management
  status           contact_status  not null default 'captured',
  stage            follow_up_stage not null default 'to_follow_up',
  user_notes       text,

  -- Phase 2 sync (empty in Phase 1)
  external_id        text,              -- e.g. Notion page id of the mirrored row
  external_synced_at timestamptz,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
-- Scanning the same person twice at one event updates the row instead of duplicating it.
create unique index contacts_once_per_event on contacts (user_id, event_id, profile_url);
create index contacts_user_due     on contacts (user_id, next_step_date);
create index contacts_user_event   on contacts (user_id, event_id);
create index contacts_user_project on contacts (user_id, project_id);
create index contacts_user_stage   on contacts (user_id, stage);
create trigger contacts_updated before update on contacts for each row execute function set_updated_at();

-- ---------- row level security: every user sees only their own rows ----------
alter table events   enable row level security;
alter table projects enable row level security;
alter table contacts enable row level security;

create policy "own events" on events for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own projects" on projects for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own contacts" on contacts for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant select, insert, update, delete on events, projects, contacts to authenticated;

-- ---------- legacy storage: existing voice memos ----------
insert into storage.buckets (id, name, public) values ('voice-notes', 'voice-notes', false)
on conflict (id) do nothing;

-- Objects are stored as '<user_id>/<contact_id>.webm'.
create policy "own voice notes" on storage.objects for all to authenticated
  using (bucket_id = 'voice-notes' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'voice-notes' and (storage.foldername(name))[1] = (select auth.uid())::text);
