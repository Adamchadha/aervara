-- Approval gate flag used by middleware + protected pages.

alter table public.user_profiles
  add column if not exists is_approved boolean;

update public.user_profiles
set is_approved = coalesce(is_approved, invite_status = 'approved');

alter table public.user_profiles
  alter column is_approved set default false;

