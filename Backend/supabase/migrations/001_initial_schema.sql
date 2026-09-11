-- ============================================================================
-- VASP Trace -- Initial Supabase PostgreSQL schema
-- ============================================================================
-- Complete, directly executable in the Supabase SQL Editor on a fresh
-- Supabase project. Creates every table, index, trigger, and Row Level
-- Security policy this application needs for authenticated users to manage
-- their own investigations.
--
-- Matches the existing FastAPI backend's actual read/write shape
-- (Backend/app/investigations.py, Backend/app/investigations_db.py,
-- Backend/app/risk.py) -- see Backend/supabase/README.md for the mapping
-- and the assumptions made where the backend doesn't fully pin down a
-- column's type/constraints.
--
-- No secrets, API keys, or passwords are stored here or required to run
-- this file. Supabase Auth (auth.users) handles authentication entirely;
-- this schema only references auth.users(id) as a foreign key.
-- ============================================================================


-- ============================================================================
-- 0. Extensions
-- ============================================================================
-- gen_random_uuid() -- built into Postgres 13+ / Supabase via pgcrypto.
create extension if not exists pgcrypto;


-- ============================================================================
-- 1. Shared helper: keep updated_at current on every UPDATE
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================================
-- 2. profiles
-- One row per Supabase Auth user. Created automatically by the
-- handle_new_user() trigger below -- never inserted directly by the app.
-- ============================================================================
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  role       text not null default 'investigator',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- No insert/delete policy for regular users: rows are created only by the
-- security-definer trigger below and are never client-deleted.


-- ============================================================================
-- 3. Auto-create a profiles row whenever a new auth.users row appears.
-- security definer: runs with the function owner's privileges so it can
-- insert into public.profiles regardless of the new user's own RLS grants
-- (the new user has no profiles row -- and therefore no RLS-granted access
-- to it -- until this trigger creates one).
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================================
-- 4. Human-readable case numbers, e.g. VT-2026-0001
-- Backed by a single monotonically increasing sequence, formatted with the
-- current year at generation time. See README "Assumptions" for why this
-- does not reset the counter at each new year.
-- ============================================================================
create sequence if not exists public.investigation_case_number_seq;

create or replace function public.generate_case_number()
returns text
language sql
as $$
  select 'VT-' || extract(year from now())::text || '-' ||
         lpad(nextval('public.investigation_case_number_seq')::text, 4, '0');
$$;


-- ============================================================================
-- 5. investigations
-- The core case record. wallet_address is the source address being traced;
-- max_hops/max_nodes are the trace bounds (defaults match
-- Backend/app/traversal.py's DEFAULT_MAX_HOPS=4 / DEFAULT_MAX_NODES=150, and
-- the CHECK ranges match Backend/app/investigations.py's InvestigationCreate
-- validation, ge=1/le=8 and ge=1/le=500, as defense-in-depth at the DB
-- layer). risk_score/classification are written by POST
-- /investigations/{id}/trace after each trace run (see
-- Backend/app/risk.py::classify_trace_result).
-- ============================================================================
create table if not exists public.investigations (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  case_number    text not null default public.generate_case_number(),
  title          text not null,
  wallet_address text not null,
  status         text not null default 'OPEN',
  max_hops       integer not null default 4 check (max_hops between 1 and 8),
  max_nodes      integer not null default 150 check (max_nodes between 1 and 500),
  risk_score     numeric(5, 2) check (risk_score is null or risk_score between 0 and 100),
  classification text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint investigations_case_number_key unique (case_number)
);

create index if not exists investigations_user_id_idx
  on public.investigations (user_id);

create index if not exists investigations_wallet_address_idx
  on public.investigations (wallet_address);

drop trigger if exists investigations_set_updated_at on public.investigations;
create trigger investigations_set_updated_at
  before update on public.investigations
  for each row execute procedure public.set_updated_at();

alter table public.investigations enable row level security;

drop policy if exists "investigations_select_own" on public.investigations;
create policy "investigations_select_own"
  on public.investigations for select
  using (user_id = auth.uid());

drop policy if exists "investigations_insert_own" on public.investigations;
create policy "investigations_insert_own"
  on public.investigations for insert
  with check (user_id = auth.uid());

drop policy if exists "investigations_update_own" on public.investigations;
create policy "investigations_update_own"
  on public.investigations for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "investigations_delete_own" on public.investigations;
create policy "investigations_delete_own"
  on public.investigations for delete
  using (user_id = auth.uid());


-- ============================================================================
-- 6. investigation_results
-- One row per trace run against an investigation (POST
-- /investigations/{id}/trace persists the full JSON response here
-- unmodified -- see Backend/app/investigations_db.py::save_trace_result).
-- No direct user_id column: ownership is derived from the parent
-- investigation, so policies join through investigations.user_id.
-- ============================================================================
create table if not exists public.investigation_results (
  id               uuid primary key default gen_random_uuid(),
  investigation_id uuid not null references public.investigations (id) on delete cascade,
  result           jsonb not null,
  created_at       timestamptz not null default now()
);

create index if not exists investigation_results_investigation_id_idx
  on public.investigation_results (investigation_id);

alter table public.investigation_results enable row level security;

drop policy if exists "investigation_results_owner_select" on public.investigation_results;
create policy "investigation_results_owner_select"
  on public.investigation_results for select
  using (
    exists (
      select 1 from public.investigations i
      where i.id = investigation_results.investigation_id
        and i.user_id = auth.uid()
    )
  );

drop policy if exists "investigation_results_owner_insert" on public.investigation_results;
create policy "investigation_results_owner_insert"
  on public.investigation_results for insert
  with check (
    exists (
      select 1 from public.investigations i
      where i.id = investigation_results.investigation_id
        and i.user_id = auth.uid()
    )
  );


-- ============================================================================
-- 7. evidence
-- Supporting artifacts attached to an investigation (freeform evidence_type,
-- e.g. "screenshot", "tx_proof", "external_report"). No direct user_id
-- column, same ownership-via-parent pattern as investigation_results.
-- ============================================================================
create table if not exists public.evidence (
  id               uuid primary key default gen_random_uuid(),
  investigation_id uuid not null references public.investigations (id) on delete cascade,
  evidence_type    text not null,
  title            text not null,
  description      text,
  data             jsonb,
  created_at       timestamptz not null default now()
);

create index if not exists evidence_investigation_id_idx
  on public.evidence (investigation_id);

alter table public.evidence enable row level security;

drop policy if exists "evidence_owner_select" on public.evidence;
create policy "evidence_owner_select"
  on public.evidence for select
  using (
    exists (
      select 1 from public.investigations i
      where i.id = evidence.investigation_id
        and i.user_id = auth.uid()
    )
  );

drop policy if exists "evidence_owner_insert" on public.evidence;
create policy "evidence_owner_insert"
  on public.evidence for insert
  with check (
    exists (
      select 1 from public.investigations i
      where i.id = evidence.investigation_id
        and i.user_id = auth.uid()
    )
  );

drop policy if exists "evidence_owner_delete" on public.evidence;
create policy "evidence_owner_delete"
  on public.evidence for delete
  using (
    exists (
      select 1 from public.investigations i
      where i.id = evidence.investigation_id
        and i.user_id = auth.uid()
    )
  );


-- ============================================================================
-- 8. investigation_notes
-- Free-text investigator notes. Has both user_id (the note's author) and
-- investigation_id -- policies check both so a note can never be attached
-- to an investigation the caller doesn't own, even if user_id matches.
-- ============================================================================
create table if not exists public.investigation_notes (
  id               uuid primary key default gen_random_uuid(),
  investigation_id uuid not null references public.investigations (id) on delete cascade,
  user_id          uuid not null references auth.users (id) on delete cascade,
  content          text not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists investigation_notes_investigation_id_idx
  on public.investigation_notes (investigation_id);

create index if not exists investigation_notes_user_id_idx
  on public.investigation_notes (user_id);

drop trigger if exists investigation_notes_set_updated_at on public.investigation_notes;
create trigger investigation_notes_set_updated_at
  before update on public.investigation_notes
  for each row execute procedure public.set_updated_at();

alter table public.investigation_notes enable row level security;

drop policy if exists "investigation_notes_owner_select" on public.investigation_notes;
create policy "investigation_notes_owner_select"
  on public.investigation_notes for select
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.investigations i
      where i.id = investigation_notes.investigation_id
        and i.user_id = auth.uid()
    )
  );

drop policy if exists "investigation_notes_owner_insert" on public.investigation_notes;
create policy "investigation_notes_owner_insert"
  on public.investigation_notes for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.investigations i
      where i.id = investigation_notes.investigation_id
        and i.user_id = auth.uid()
    )
  );

drop policy if exists "investigation_notes_owner_update" on public.investigation_notes;
create policy "investigation_notes_owner_update"
  on public.investigation_notes for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "investigation_notes_owner_delete" on public.investigation_notes;
create policy "investigation_notes_owner_delete"
  on public.investigation_notes for delete
  using (user_id = auth.uid());


-- ============================================================================
-- 9. copilot_conversations
-- Schema-only preparation for a future Gemini "investigator copilot"
-- feature. No application code reads or writes this table yet -- see
-- Backend/supabase/README.md.
-- ============================================================================
create table if not exists public.copilot_conversations (
  id               uuid primary key default gen_random_uuid(),
  investigation_id uuid not null references public.investigations (id) on delete cascade,
  user_id          uuid not null references auth.users (id) on delete cascade,
  created_at       timestamptz not null default now()
);

create index if not exists copilot_conversations_investigation_id_idx
  on public.copilot_conversations (investigation_id);

create index if not exists copilot_conversations_user_id_idx
  on public.copilot_conversations (user_id);

alter table public.copilot_conversations enable row level security;

drop policy if exists "copilot_conversations_owner_select" on public.copilot_conversations;
create policy "copilot_conversations_owner_select"
  on public.copilot_conversations for select
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.investigations i
      where i.id = copilot_conversations.investigation_id
        and i.user_id = auth.uid()
    )
  );

drop policy if exists "copilot_conversations_owner_insert" on public.copilot_conversations;
create policy "copilot_conversations_owner_insert"
  on public.copilot_conversations for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.investigations i
      where i.id = copilot_conversations.investigation_id
        and i.user_id = auth.uid()
    )
  );

drop policy if exists "copilot_conversations_owner_delete" on public.copilot_conversations;
create policy "copilot_conversations_owner_delete"
  on public.copilot_conversations for delete
  using (user_id = auth.uid());


-- ============================================================================
-- 10. copilot_messages
-- Schema-only preparation, same as copilot_conversations. No user_id or
-- investigation_id column of its own -- ownership is derived by joining
-- through copilot_conversations -> investigations.
-- ============================================================================
create table if not exists public.copilot_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.copilot_conversations (id) on delete cascade,
  role            text not null,
  content         text not null,
  metadata        jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists copilot_messages_conversation_id_idx
  on public.copilot_messages (conversation_id);

alter table public.copilot_messages enable row level security;

drop policy if exists "copilot_messages_owner_select" on public.copilot_messages;
create policy "copilot_messages_owner_select"
  on public.copilot_messages for select
  using (
    exists (
      select 1 from public.copilot_conversations c
      join public.investigations i on i.id = c.investigation_id
      where c.id = copilot_messages.conversation_id
        and i.user_id = auth.uid()
    )
  );

drop policy if exists "copilot_messages_owner_insert" on public.copilot_messages;
create policy "copilot_messages_owner_insert"
  on public.copilot_messages for insert
  with check (
    exists (
      select 1 from public.copilot_conversations c
      join public.investigations i on i.id = c.investigation_id
      where c.id = copilot_messages.conversation_id
        and i.user_id = auth.uid()
    )
  );

-- ============================================================================
-- End of migration
-- ============================================================================
