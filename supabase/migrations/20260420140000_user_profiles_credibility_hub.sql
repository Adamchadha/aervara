-- Credibility / identity hub fields for deal relevance.

alter table public.user_profiles
  add column if not exists title text,
  add column if not exists target_cities text,
  add column if not exists deal_size_range text,
  add column if not exists asset_type_interest text,
  add column if not exists verification_status text;

update public.user_profiles
set verification_status = coalesce(verification_status, 'verification_pending');

alter table public.user_profiles
  alter column verification_status set default 'verification_pending';
