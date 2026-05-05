-- Auto-create `public.user_profiles` for every new auth user.
-- Also adds `access_status` (parallel to invite flow; default pending).

alter table public.user_profiles
  add column if not exists access_status text;

update public.user_profiles
set access_status = case
  when coalesce(access_status, '') = '' and invite_status = 'approved' then 'approved'
  when coalesce(access_status, '') = '' and invite_status = 'rejected' then 'rejected'
  when coalesce(access_status, '') = '' then 'pending'
  else access_status
end;

alter table public.user_profiles
  alter column access_status set default 'pending';

update public.user_profiles
set access_status = 'pending'
where access_status is null;

alter table public.user_profiles
  alter column access_status set not null;

alter table public.user_profiles
  drop constraint if exists user_profiles_access_status_check;

alter table public.user_profiles
  add constraint user_profiles_access_status_check check (
    access_status in ('pending', 'approved', 'rejected')
  );

-- Idempotent: existing auth users without a profile row (e.g. pre-trigger).
insert into public.user_profiles (
  user_id,
  email,
  role,
  access_status,
  is_approved,
  invite_status,
  verification_status
)
select
  u.id,
  u.email,
  'investor',
  'pending',
  false,
  'pending',
  'unverified'
from auth.users u
where not exists (
  select 1 from public.user_profiles p where p.user_id = u.id
)
on conflict (user_id) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (
    user_id,
    email,
    role,
    access_status,
    is_approved,
    invite_status,
    verification_status
  )
  values (
    new.id,
    new.email,
    'investor',
    'pending',
    false,
    'pending',
    'unverified'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
