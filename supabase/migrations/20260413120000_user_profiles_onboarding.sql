-- Lightweight user profile for role-based onboarding (network layer later).

create table public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  role text
    constraint user_profiles_role_check check (
      role is null
      or role in ('developer', 'investor', 'broker', 'acquisition', 'other')
    ),
  firm_name text,
  market_focus text,
  city_region text,
  asset_interest text,
  notes text,
  onboarding_skipped boolean not null default false,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_profiles_user_id_idx on public.user_profiles (user_id);

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

-- Existing accounts: mark onboarding done so we do not block current users.
insert into public.user_profiles (
  user_id,
  onboarding_completed_at,
  onboarding_skipped,
  updated_at
)
select
  u.id,
  now(),
  true,
  now()
from auth.users u
where not exists (
  select 1 from public.user_profiles p where p.user_id = u.id
);
