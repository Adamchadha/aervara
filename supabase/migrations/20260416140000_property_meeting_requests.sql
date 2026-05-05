-- Lightweight meeting requests tied to a property (digital → real-world bridge).

create table public.property_meeting_requests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  requesting_user_role text,
  meeting_type text not null
    constraint property_meeting_requests_meeting_type_check check (
      meeting_type in ('in_person', 'video_call', 'phone_call')
    ),
  preferred_range_start date not null,
  preferred_range_end date not null,
  agenda text not null,
  notes text,
  status text not null default 'new'
    constraint property_meeting_requests_status_check check (
      status in ('new', 'reviewed', 'scheduled', 'cancelled', 'closed')
    ),
  created_at timestamptz not null default now(),
  constraint property_meeting_requests_date_range_check check (
    preferred_range_end >= preferred_range_start
  )
);

create index property_meeting_requests_property_id_idx
  on public.property_meeting_requests (property_id);

create index property_meeting_requests_user_id_idx
  on public.property_meeting_requests (user_id);

create index property_meeting_requests_created_at_idx
  on public.property_meeting_requests (created_at desc);

create index property_meeting_requests_status_idx
  on public.property_meeting_requests (status);

alter table public.property_meeting_requests enable row level security;

create policy "property_meeting_requests_insert_own_property"
  on public.property_meeting_requests for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
    )
  );

create policy "property_meeting_requests_select_own"
  on public.property_meeting_requests for select
  using (auth.uid() = user_id);

create policy "property_meeting_requests_delete_own"
  on public.property_meeting_requests for delete
  using (auth.uid() = user_id);
