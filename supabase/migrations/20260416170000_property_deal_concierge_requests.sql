-- Deal Concierge: curated connection requests around a site (Aervara as intermediary).

create table public.property_deal_concierge_requests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  requester_role text not null
    constraint property_deal_concierge_requests_requester_role_check check (
      requester_role in (
        'developer',
        'investor',
        'broker',
        'partner',
        'acquisition_team',
        'other'
      )
    ),
  intent text not null,
  connection_type text not null
    constraint property_deal_concierge_requests_connection_type_check check (
      connection_type in ('call', 'meeting', 'intro')
    ),
  urgency text not null
    constraint property_deal_concierge_requests_urgency_check check (
      urgency in ('low', 'standard', 'high')
    ),
  message text,
  status text not null default 'new'
    constraint property_deal_concierge_requests_status_check check (
      status in ('new', 'reviewed', 'in_progress', 'complete', 'closed')
    ),
  created_at timestamptz not null default now()
);

create index property_deal_concierge_requests_property_id_idx
  on public.property_deal_concierge_requests (property_id);

create index property_deal_concierge_requests_user_id_idx
  on public.property_deal_concierge_requests (user_id);

create index property_deal_concierge_requests_created_at_idx
  on public.property_deal_concierge_requests (created_at desc);

alter table public.property_deal_concierge_requests enable row level security;

create policy "property_deal_concierge_requests_insert_own_property"
  on public.property_deal_concierge_requests for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
    )
  );

create policy "property_deal_concierge_requests_select_own"
  on public.property_deal_concierge_requests for select
  using (auth.uid() = user_id);

create policy "property_deal_concierge_requests_delete_own"
  on public.property_deal_concierge_requests for delete
  using (auth.uid() = user_id);
