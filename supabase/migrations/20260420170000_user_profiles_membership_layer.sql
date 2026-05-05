-- Exclusive membership/network layer fields for user profiles.

alter table public.user_profiles
  add column if not exists membership_tier text,
  add column if not exists profile_visibility text,
  add column if not exists invite_status text,
  add column if not exists network_access_notes text;

update public.user_profiles
set
  membership_tier = coalesce(membership_tier, 'standard'),
  profile_visibility = coalesce(profile_visibility, 'public_within_network');

alter table public.user_profiles
  alter column membership_tier set default 'standard';

alter table public.user_profiles
  alter column profile_visibility set default 'public_within_network';
