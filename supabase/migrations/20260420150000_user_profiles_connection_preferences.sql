-- Connection preferences for profile credibility/actionability.

alter table public.user_profiles
  add column if not exists open_to_introductions boolean not null default true,
  add column if not exists looking_for text,
  add column if not exists preferred_contact_method text,
  add column if not exists available_for_in_person_meetings boolean not null default false,
  add column if not exists preferred_meeting_cities text,
  add column if not exists phone text,
  add column if not exists intro_notes text;

update public.user_profiles
set preferred_contact_method = coalesce(preferred_contact_method, contact_preference)
where preferred_contact_method is null;
