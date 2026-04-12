-- Aervara MVP: properties per user with RLS

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  address text not null,
  city text not null,
  state text not null,
  zoning_district text not null,
  lot_size_sqft numeric not null check (lot_size_sqft > 0),
  built_floor_area_sqft numeric not null check (built_floor_area_sqft >= 0),
  max_far numeric not null check (max_far > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index properties_user_id_idx on public.properties (user_id);
create index properties_created_at_idx on public.properties (created_at desc);

alter table public.properties enable row level security;

create policy "properties_select_own"
  on public.properties for select
  using (auth.uid() = user_id);

create policy "properties_insert_own"
  on public.properties for insert
  with check (auth.uid() = user_id);

create policy "properties_update_own"
  on public.properties for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "properties_delete_own"
  on public.properties for delete
  using (auth.uid() = user_id);
