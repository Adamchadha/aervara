-- Canonical `user_profiles` (application contract):
--   user_id uuid PK → auth.users.id
--   email, role, display_name, full_name, company, market, asset_interest, bio,
--   website, linkedin, contact_preference, avatar_url,
--   onboarding_skipped, onboarding_completed_at, created_at, updated_at
--
-- Migrates legacy columns when present: id, firm_name, market_focus, city_region, notes,
-- website_url, linkedin_url.

do $migrate$
declare
  pk_name text;
begin
  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'user_profiles'
  ) then
    create table public.user_profiles (
      user_id uuid primary key references auth.users (id) on delete cascade,
      email text,
      role text
        constraint user_profiles_role_check check (
          role is null
          or role in ('developer', 'investor', 'broker', 'acquisition', 'other')
        ),
      display_name text,
      full_name text,
      company text,
      market text,
      asset_interest text,
      bio text,
      website text,
      linkedin text,
      contact_preference text,
      avatar_url text,
      onboarding_skipped boolean not null default false,
      onboarding_completed_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    alter table public.user_profiles enable row level security;

    create policy "user_profiles_select_own"
      on public.user_profiles for select
      using (auth.uid() = user_id);

    create policy "user_profiles_insert_own"
      on public.user_profiles for insert
      with check (auth.uid() = user_id);

    create policy "user_profiles_update_own"
      on public.user_profiles for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);

    create policy "user_profiles_delete_own"
      on public.user_profiles for delete
      using (auth.uid() = user_id);

    return;
  end if;

  -- New canonical columns
  alter table public.user_profiles add column if not exists email text;
  alter table public.user_profiles add column if not exists full_name text;
  alter table public.user_profiles add column if not exists company text;
  alter table public.user_profiles add column if not exists market text;
  alter table public.user_profiles add column if not exists website text;
  alter table public.user_profiles add column if not exists linkedin text;

  -- Ensure user_id exists and references the auth user
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_profiles'
      and column_name = 'user_id'
  ) then
    alter table public.user_profiles add column user_id uuid;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_profiles'
      and column_name = 'id'
  ) then
    update public.user_profiles
    set user_id = id
    where user_id is null or user_id is distinct from id;
  end if;

  alter table public.user_profiles alter column user_id set not null;

  -- Backfill from legacy names
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_profiles'
      and column_name = 'firm_name'
  ) then
    update public.user_profiles
    set company = coalesce(nullif(trim(company), ''), nullif(trim(firm_name), ''));
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_profiles'
      and column_name = 'market_focus'
  )
     and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_profiles'
      and column_name = 'city_region'
  ) then
    update public.user_profiles
    set market = coalesce(
      nullif(trim(market), ''),
      nullif(
        trim(both ' · ' from concat_ws(
          ' · ',
          nullif(trim(city_region), ''),
          nullif(trim(market_focus), '')
        )),
        ''
      )
    );
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_profiles'
      and column_name = 'market_focus'
  ) then
    update public.user_profiles
    set market = coalesce(nullif(trim(market), ''), nullif(trim(market_focus), ''));
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_profiles'
      and column_name = 'city_region'
  ) then
    update public.user_profiles
    set market = coalesce(nullif(trim(market), ''), nullif(trim(city_region), ''));
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_profiles'
      and column_name = 'website_url'
  ) then
    update public.user_profiles
    set website = coalesce(nullif(trim(website), ''), nullif(trim(website_url), ''));
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_profiles'
      and column_name = 'linkedin_url'
  ) then
    update public.user_profiles
    set linkedin = coalesce(nullif(trim(linkedin), ''), nullif(trim(linkedin_url), ''));
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_profiles'
      and column_name = 'notes'
  ) then
    update public.user_profiles
    set bio = coalesce(nullif(trim(bio), ''), nullif(trim(notes), ''));
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_profiles'
      and column_name = 'display_name'
  ) then
    update public.user_profiles
    set full_name = coalesce(
      nullif(trim(full_name), ''),
      nullif(trim(display_name), '')
    );
  end if;

  update public.user_profiles up
  set email = coalesce(nullif(trim(up.email), ''), au.email::text)
  from auth.users au
  where au.id = up.user_id;

  -- Drop FK on legacy `id` before reshaping PK
  alter table public.user_profiles drop constraint if exists user_profiles_id_fkey;

  -- Drop primary key (name may vary)
  select c.conname
    into pk_name
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  where n.nspname = 'public'
    and t.relname = 'user_profiles'
    and c.contype = 'p'
  limit 1;

  if pk_name is not null then
    execute format('alter table public.user_profiles drop constraint %I', pk_name);
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'user_profiles'
      and column_name = 'id'
  ) then
    alter table public.user_profiles drop column id;
  end if;

  alter table public.user_profiles drop constraint if exists user_profiles_user_id_fkey;
  alter table public.user_profiles drop constraint if exists user_profiles_user_id_key;

  alter table public.user_profiles
    add constraint user_profiles_pkey primary key (user_id);

  alter table public.user_profiles
    add constraint user_profiles_user_id_fkey
    foreign key (user_id) references auth.users (id) on delete cascade;

  -- Remove legacy columns the app no longer reads
  alter table public.user_profiles drop column if exists firm_name;
  alter table public.user_profiles drop column if exists market_focus;
  alter table public.user_profiles drop column if exists city_region;
  alter table public.user_profiles drop column if exists notes;
  alter table public.user_profiles drop column if exists website_url;
  alter table public.user_profiles drop column if exists linkedin_url;
end
$migrate$;

drop policy if exists "user_profiles_select_own" on public.user_profiles;
drop policy if exists "user_profiles_insert_own" on public.user_profiles;
drop policy if exists "user_profiles_update_own" on public.user_profiles;
drop policy if exists "user_profiles_delete_own" on public.user_profiles;

create policy "user_profiles_select_own"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "user_profiles_insert_own"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "user_profiles_update_own"
  on public.user_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_profiles_delete_own"
  on public.user_profiles for delete
  using (auth.uid() = user_id);

create index if not exists user_profiles_email_idx
  on public.user_profiles (lower(email))
  where email is not null;

insert into public.user_profiles (
  user_id,
  email,
  onboarding_completed_at,
  onboarding_skipped,
  updated_at
)
select
  u.id,
  u.email::text,
  now(),
  true,
  now()
from auth.users u
where not exists (
  select 1
  from public.user_profiles p
  where p.user_id = u.id
);
