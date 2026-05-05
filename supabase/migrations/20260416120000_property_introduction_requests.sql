-- Structured introduction requests around a property (Aervara as connector layer).

create table public.property_introduction_requests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  requesting_user_role text,
  target_role text not null
    constraint property_introduction_requests_target_role_check check (
      target_role in (
        'developer',
        'investor',
        'broker',
        'partner',
        'acquisition_team'
      )
    ),
  purpose text not null
    constraint property_introduction_requests_purpose_check check (
      purpose in (
        'explore_acquisition',
        'explore_investment',
        'explore_brokerage_marketing',
        'discuss_partnership',
        'general_inquiry'
      )
    ),
  message text not null,
  status text not null default 'new'
    constraint property_introduction_requests_status_check check (
      status in ('new', 'reviewed', 'connected', 'closed')
    ),
  created_at timestamptz not null default now()
);

create index property_introduction_requests_property_id_idx
  on public.property_introduction_requests (property_id);

create index property_introduction_requests_user_id_idx
  on public.property_introduction_requests (user_id);

create index property_introduction_requests_created_at_idx
  on public.property_introduction_requests (created_at desc);

create index property_introduction_requests_status_idx
  on public.property_introduction_requests (status);

alter table public.property_introduction_requests enable row level security;

create policy "property_introduction_requests_insert_own_property"
  on public.property_introduction_requests for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
    )
  );

create policy "property_introduction_requests_select_own"
  on public.property_introduction_requests for select
  using (auth.uid() = user_id);

create policy "property_introduction_requests_delete_own"
  on public.property_introduction_requests for delete
  using (auth.uid() = user_id);
