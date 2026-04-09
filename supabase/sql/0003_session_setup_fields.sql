-- =========================================================
-- 0003_session_setup_fields.sql
-- Add seller-selected session setup fields
-- =========================================================

alter table public.roleplay_sessions
add column if not exists selected_industry text,
add column if not exists selected_roleplay_type text,
add column if not exists selected_buyer_mood text;

alter table public.roleplay_sessions
drop constraint if exists roleplay_sessions_selected_buyer_mood_check;

alter table public.roleplay_sessions
add constraint roleplay_sessions_selected_buyer_mood_check
check (
  selected_buyer_mood is null
  or selected_buyer_mood in ('nice', 'less_rude', 'rude')
);