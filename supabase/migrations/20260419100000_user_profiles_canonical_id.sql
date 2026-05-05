-- Standardize user_profiles identity key to `id` (auth.users.id).
-- Keeps compatibility with older tables that still carry `user_id`.

do $$
begin
  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'user_profiles'
  ) then
    return;
  end if;

  -- If legacy `user_id` exists, align primary key values to auth user ids.
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_profiles'
      and column_name = 'user_id'
  ) then
    update public.user_profiles
    set id = user_id
    where user_id is not null
      and id is distinct from user_id;
  end if;

  -- Ensure canonical FK on id.
  alter table public.user_profiles
    drop constraint if exists user_profiles_id_fkey;

  alter table public.user_profiles
    add constraint user_profiles_id_fkey
    foreign key (id) references auth.users (id) on delete cascade;

  alter table public.user_profiles
    alter column id drop default;
end
$$;

-- Update RLS policies to use canonical `id`.
drop policy if exists "user_profiles_select_own" on public.user_profiles;
drop policy if exists "user_profiles_insert_own" on public.user_profiles;
drop policy if exists "user_profiles_update_own" on public.user_profiles;
drop policy if exists "user_profiles_delete_own" on public.user_profiles;

create policy "user_profiles_select_own"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "user_profiles_insert_own"
  on public.user_profiles for insert
  with check (auth.uid() = id);

create policy "user_profiles_update_own"
  on public.user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "user_profiles_delete_own"
  on public.user_profiles for delete
  using (auth.uid() = id);

-- Backfill missing rows by canonical key.
insert into public.user_profiles (id, onboarding_completed_at, onboarding_skipped, updated_at)
select u.id, now(), true, now()
from auth.users u
where not exists (
  select 1
  from public.user_profiles p
  where p.id = u.id
);
