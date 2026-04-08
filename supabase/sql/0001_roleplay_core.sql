-- =========================================================
-- 0001_roleplay_core.sql
-- Core schema for Genim Voice Roleplay MVP
-- =========================================================

create extension if not exists pgcrypto;

-- =========================================================
-- PROFILES
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  avatar_url text,
  role text not null default 'learner' check (role in ('learner', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- SCENARIOS
-- =========================================================
create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  industry text,
  difficulty text not null default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced')),
  objective text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- BUYER PERSONAS
-- one active persona per scenario for MVP
-- =========================================================
create table if not exists public.buyer_personas (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.scenarios(id) on delete cascade,
  name text not null,
  title text,
  company_name text,
  company_size text,
  tone text,
  background text,
  hidden_pain_points jsonb not null default '[]'::jsonb,
  common_objections jsonb not null default '[]'::jsonb,
  goals jsonb not null default '[]'::jsonb,
  constraints jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists buyer_personas_one_active_per_scenario_idx
on public.buyer_personas (scenario_id)
where is_active = true;

-- =========================================================
-- SCORING RUBRICS
-- =========================================================
create table if not exists public.scoring_rubrics (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.scenarios(id) on delete cascade,
  name text not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scoring_rubric_items (
  id uuid primary key default gen_random_uuid(),
  rubric_id uuid not null references public.scoring_rubrics(id) on delete cascade,
  category_key text not null,
  category_label text not null,
  max_score integer not null check (max_score > 0),
  weight numeric(5,2) not null default 1.00,
  sort_order integer not null default 0,
  guidance text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists scoring_rubric_items_unique_category_idx
on public.scoring_rubric_items (rubric_id, category_key);

-- =========================================================
-- ROLEPLAY SESSIONS
-- =========================================================
create table if not exists public.roleplay_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  scenario_id uuid not null references public.scenarios(id) on delete restrict,
  buyer_persona_id uuid references public.buyer_personas(id) on delete set null,
  rubric_id uuid references public.scoring_rubrics(id) on delete set null,
  mode text not null default 'voice' check (mode in ('voice', 'text')),
  status text not null default 'draft' check (status in ('draft', 'live', 'completed', 'evaluated', 'failed')),
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer,
  transcript_text text,
  summary text,
  overall_score numeric(5,2),
  strengths jsonb not null default '[]'::jsonb,
  improvements jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists roleplay_sessions_user_id_idx
on public.roleplay_sessions (user_id);

create index if not exists roleplay_sessions_scenario_id_idx
on public.roleplay_sessions (scenario_id);

create index if not exists roleplay_sessions_status_idx
on public.roleplay_sessions (status);

-- =========================================================
-- SESSION MESSAGES
-- Stores transcript turns
-- =========================================================
create table if not exists public.session_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.roleplay_sessions(id) on delete cascade,
  speaker text not null check (speaker in ('user', 'assistant', 'system')),
  message_text text not null,
  turn_index integer not null,
  started_at timestamptz,
  ended_at timestamptz,
  audio_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists session_messages_session_turn_idx
on public.session_messages (session_id, turn_index);

create index if not exists session_messages_session_id_idx
on public.session_messages (session_id);

-- =========================================================
-- SESSION SCORES
-- per-category evaluation result
-- =========================================================
create table if not exists public.session_scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.roleplay_sessions(id) on delete cascade,
  rubric_item_id uuid references public.scoring_rubric_items(id) on delete set null,
  category_key text not null,
  category_label text not null,
  score numeric(5,2) not null default 0,
  max_score numeric(5,2) not null default 0,
  feedback text,
  evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists session_scores_session_id_idx
on public.session_scores (session_id);

-- =========================================================
-- UPDATED_AT TRIGGER
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_scenarios_updated_at on public.scenarios;
create trigger set_scenarios_updated_at
before update on public.scenarios
for each row execute function public.set_updated_at();

drop trigger if exists set_buyer_personas_updated_at on public.buyer_personas;
create trigger set_buyer_personas_updated_at
before update on public.buyer_personas
for each row execute function public.set_updated_at();

drop trigger if exists set_scoring_rubrics_updated_at on public.scoring_rubrics;
create trigger set_scoring_rubrics_updated_at
before update on public.scoring_rubrics
for each row execute function public.set_updated_at();

drop trigger if exists set_scoring_rubric_items_updated_at on public.scoring_rubric_items;
create trigger set_scoring_rubric_items_updated_at
before update on public.scoring_rubric_items
for each row execute function public.set_updated_at();

drop trigger if exists set_roleplay_sessions_updated_at on public.roleplay_sessions;
create trigger set_roleplay_sessions_updated_at
before update on public.roleplay_sessions
for each row execute function public.set_updated_at();

-- =========================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =========================================================
-- ENABLE RLS
-- =========================================================
alter table public.profiles enable row level security;
alter table public.scenarios enable row level security;
alter table public.buyer_personas enable row level security;
alter table public.scoring_rubrics enable row level security;
alter table public.scoring_rubric_items enable row level security;
alter table public.roleplay_sessions enable row level security;
alter table public.session_messages enable row level security;
alter table public.session_scores enable row level security;

-- =========================================================
-- RLS: PROFILES
-- =========================================================
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

-- =========================================================
-- RLS: SCENARIOS / PERSONAS / RUBRICS
-- learners can read active training content
-- =========================================================
drop policy if exists "scenarios_select_active" on public.scenarios;
create policy "scenarios_select_active"
on public.scenarios
for select
to authenticated
using (active = true);

drop policy if exists "buyer_personas_select_active" on public.buyer_personas;
create policy "buyer_personas_select_active"
on public.buyer_personas
for select
to authenticated
using (is_active = true);

drop policy if exists "scoring_rubrics_select_active" on public.scoring_rubrics;
create policy "scoring_rubrics_select_active"
on public.scoring_rubrics
for select
to authenticated
using (active = true);

drop policy if exists "scoring_rubric_items_select_all" on public.scoring_rubric_items;
create policy "scoring_rubric_items_select_all"
on public.scoring_rubric_items
for select
to authenticated
using (
  exists (
    select 1
    from public.scoring_rubrics r
    where r.id = scoring_rubric_items.rubric_id
      and r.active = true
  )
);

-- =========================================================
-- RLS: ROLEPLAY SESSIONS
-- =========================================================
drop policy if exists "roleplay_sessions_select_own" on public.roleplay_sessions;
create policy "roleplay_sessions_select_own"
on public.roleplay_sessions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "roleplay_sessions_insert_own" on public.roleplay_sessions;
create policy "roleplay_sessions_insert_own"
on public.roleplay_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "roleplay_sessions_update_own" on public.roleplay_sessions;
create policy "roleplay_sessions_update_own"
on public.roleplay_sessions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================================================
-- RLS: SESSION MESSAGES
-- =========================================================
drop policy if exists "session_messages_select_own" on public.session_messages;
create policy "session_messages_select_own"
on public.session_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.roleplay_sessions s
    where s.id = session_messages.session_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists "session_messages_insert_own" on public.session_messages;
create policy "session_messages_insert_own"
on public.session_messages
for insert
to authenticated
with check (
  exists (
    select 1
    from public.roleplay_sessions s
    where s.id = session_messages.session_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists "session_messages_update_own" on public.session_messages;
create policy "session_messages_update_own"
on public.session_messages
for update
to authenticated
using (
  exists (
    select 1
    from public.roleplay_sessions s
    where s.id = session_messages.session_id
      and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.roleplay_sessions s
    where s.id = session_messages.session_id
      and s.user_id = auth.uid()
  )
);

-- =========================================================
-- RLS: SESSION SCORES
-- =========================================================
drop policy if exists "session_scores_select_own" on public.session_scores;
create policy "session_scores_select_own"
on public.session_scores
for select
to authenticated
using (
  exists (
    select 1
    from public.roleplay_sessions s
    where s.id = session_scores.session_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists "session_scores_insert_own" on public.session_scores;
create policy "session_scores_insert_own"
on public.session_scores
for insert
to authenticated
with check (
  exists (
    select 1
    from public.roleplay_sessions s
    where s.id = session_scores.session_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists "session_scores_update_own" on public.session_scores;
create policy "session_scores_update_own"
on public.session_scores
for update
to authenticated
using (
  exists (
    select 1
    from public.roleplay_sessions s
    where s.id = session_scores.session_id
      and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.roleplay_sessions s
    where s.id = session_scores.session_id
      and s.user_id = auth.uid()
  )
);