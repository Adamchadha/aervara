-- Single checklist migration: every `user_profiles` column referenced by application
-- code (select/upsert/update/insert). Safe to run after older profile migrations;
-- all adds are idempotent.
-- For legacy plural renames + definitive checklist, prefer `20260420201000_user_profiles_canonical_standard.sql`.

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
  add column if not exists membership_tier text,
  add column if not exists profile_visibility text,
  add column if not exists invite_status text,
  add column if not exists network_access_notes text,
  add column if not exists example_projects text,
  add column if not exists project_notes text,
  add column if not exists brochure_link text,
  add column if not exists deck_link text,
  add column if not exists materials_pdf_link text,
  add column if not exists floor_plan_placeholder text,
  add column if not exists concept_file_placeholder text,
  add column if not exists currently_seeking text,
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
  preferred_contact_method = coalesce(preferred_contact_method, contact_preference),
  membership_tier = coalesce(membership_tier, 'standard'),
  profile_visibility = coalesce(profile_visibility, 'public_within_network');

alter table public.user_profiles
  alter column verification_status set default 'verification_pending';

alter table public.user_profiles
  alter column membership_tier set default 'standard';

alter table public.user_profiles
  alter column profile_visibility set default 'public_within_network';
