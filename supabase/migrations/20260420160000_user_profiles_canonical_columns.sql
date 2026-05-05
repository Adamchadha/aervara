-- Canonical additive migration for every `user_profiles` column referenced by app code.
-- Intentionally additive/idempotent only.
-- Full column checklist (includes membership + materials): see 20260420190000_user_profiles_final_app_schema.sql

alter table public.user_profiles
  add column if not exists user_id uuid,
  add column if not exists email text,
  add column if not exists role text,
  add column if not exists display_name text,
  add column if not exists full_name text,
  add column if not exists company text,
  add column if not exists title text,
  add column if not exists market text,
  add column if not exists target_cities text,
  add column if not exists deal_size_range text,
  add column if not exists asset_interest text,
  add column if not exists asset_type_interest text,
  add column if not exists bio text,
  add column if not exists website text,
  add column if not exists linkedin text,
  add column if not exists contact_preference text,
  add column if not exists open_to_introductions boolean not null default true,
  add column if not exists looking_for text,
  add column if not exists preferred_contact_method text,
  add column if not exists available_for_in_person_meetings boolean not null default false,
  add column if not exists preferred_meeting_cities text,
  add column if not exists phone text,
  add column if not exists intro_notes text,
  add column if not exists avatar_url text,
  add column if not exists verification_status text,
  add column if not exists onboarding_skipped boolean not null default false,
  add column if not exists onboarding_completed_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.user_profiles
set
  verification_status = coalesce(verification_status, 'verification_pending'),
  preferred_contact_method = coalesce(preferred_contact_method, contact_preference);

alter table public.user_profiles
  alter column verification_status set default 'verification_pending';
