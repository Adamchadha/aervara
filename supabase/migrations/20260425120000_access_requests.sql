-- Full-access / demo lead capture (Request Full Access flow).

create table public.access_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null
    constraint access_requests_role_check check (
      role in ('developer', 'investor', 'broker', 'acquisition', 'other')
    ),
  company text,
  city_market text not null,
  use_case text not null,
  source_route text not null default '/apply',
  requested_from_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create index access_requests_created_at_idx
  on public.access_requests (created_at desc);

create index access_requests_user_id_idx
  on public.access_requests (user_id);

create index access_requests_demo_idx
  on public.access_requests (requested_from_demo)
  where requested_from_demo = true;

alter table public.access_requests enable row level security;

create policy "access_requests_insert_own"
  on public.access_requests for insert
  with check (auth.uid() = user_id);

create policy "access_requests_select_own"
  on public.access_requests for select
  using (auth.uid() = user_id);

create policy "access_requests_select_admin"
  on public.access_requests for select
  using (
    exists (
      select 1
      from public.user_profiles up
      where up.user_id = auth.uid()
        and lower(trim(coalesce(up.role, ''))) = 'admin'
    )
  );
