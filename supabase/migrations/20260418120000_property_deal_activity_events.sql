-- Append-only deal activity for Site Room timeline (site visit plan, notes); other events derived from existing tables.

create table public.property_deal_activity_events (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null
    constraint property_deal_activity_events_type_check check (
      event_type in ('site_visit_planned', 'notes_added')
    ),
  detail text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index property_deal_activity_events_property_created_idx
  on public.property_deal_activity_events (property_id, created_at desc);

create unique index property_deal_activity_one_site_plan_per_property
  on public.property_deal_activity_events (property_id)
  where (event_type = 'site_visit_planned');

alter table public.property_deal_activity_events enable row level security;

create policy "property_deal_activity_events_select_own_property"
  on public.property_deal_activity_events for select
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
    )
  );

create policy "property_deal_activity_events_insert_own_property"
  on public.property_deal_activity_events for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
    )
  );
