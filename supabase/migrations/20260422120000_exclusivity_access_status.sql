-- Exclusivity access layer:
-- - invite_status: pending | approved | rejected
-- - verification_status: unverified | verified

alter table public.user_profiles
  add column if not exists invite_status text,
  add column if not exists verification_status text;

update public.user_profiles
set
  invite_status = case
    when invite_status in ('approved', 'rejected') then invite_status
    else 'pending'
  end,
  verification_status = case
    when verification_status = 'verified' then 'verified'
    else 'unverified'
  end;

alter table public.user_profiles
  alter column invite_status set default 'pending';

alter table public.user_profiles
  alter column verification_status set default 'unverified';

alter table public.user_profiles
  drop constraint if exists user_profiles_invite_status_check;

alter table public.user_profiles
  add constraint user_profiles_invite_status_check check (
    invite_status is null or invite_status in ('pending', 'approved', 'rejected')
  );

alter table public.user_profiles
  drop constraint if exists user_profiles_verification_status_check;

alter table public.user_profiles
  add constraint user_profiles_verification_status_check check (
    verification_status is null or verification_status in ('unverified', 'verified')
  );

