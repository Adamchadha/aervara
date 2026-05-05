-- Canonical `user_profiles` schema for the Aervara app (single reference migration).
-- 1) Merges legacy duplicate column names into the canonical singular / agreed names.
-- 2) Ensures every column the app selects or upserts exists (idempotent).

-- --- Legacy plural / alternate names → canonical (safe if columns never existed) ---

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_profiles' and column_name = 'asset_type_interests'
  ) then
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'user_profiles' and column_name = 'asset_type_interest'
    ) then
      update public.user_profiles
      set asset_type_interest = coalesce(asset_type_interest, asset_type_interests);
      alter table public.user_profiles drop column asset_type_interests;
    else
      alter table public.user_profiles rename column asset_type_interests to asset_type_interest;
    end if;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_profiles' and column_name = 'brochure_links'
  ) then
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'user_profiles' and column_name = 'brochure_link'
    ) then
      update public.user_profiles set brochure_link = coalesce(brochure_link, brochure_links);
      alter table public.user_profiles drop column brochure_links;
    else
      alter table public.user_profiles rename column brochure_links to brochure_link;
    end if;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_profiles' and column_name = 'deck_links'
  ) then
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'user_profiles' and column_name = 'deck_link'
    ) then
      update public.user_profiles set deck_link = coalesce(deck_link, deck_links);
      alter table public.user_profiles drop column deck_links;
    else
      alter table public.user_profiles rename column deck_links to deck_link;
    end if;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_profiles' and column_name = 'materials_pdf_links'
  ) then
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'user_profiles' and column_name = 'materials_pdf_link'
    ) then
      update public.user_profiles
      set materials_pdf_link = coalesce(materials_pdf_link, materials_pdf_links);
      alter table public.user_profiles drop column materials_pdf_links;
    else
      alter table public.user_profiles rename column materials_pdf_links to materials_pdf_link;
    end if;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_profiles' and column_name = 'floorplan_link'
  ) then
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'user_profiles' and column_name = 'floor_plan_placeholder'
    ) then
      update public.user_profiles
      set floor_plan_placeholder = coalesce(floor_plan_placeholder, floorplan_link);
      alter table public.user_profiles drop column floorplan_link;
    else
      alter table public.user_profiles rename column floorplan_link to floor_plan_placeholder;
    end if;
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'user_profiles' and column_name = 'floorplan_links'
  ) then
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'user_profiles' and column_name = 'floor_plan_placeholder'
    ) then
      update public.user_profiles
      set floor_plan_placeholder = coalesce(floor_plan_placeholder, floorplan_links);
      alter table public.user_profiles drop column floorplan_links;
    else
      alter table public.user_profiles rename column floorplan_links to floor_plan_placeholder;
    end if;
  end if;
end $$;

-- --- Ensure full column set (matches app `USER_PROFILES_SELECT_COLUMNS`) ---

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
