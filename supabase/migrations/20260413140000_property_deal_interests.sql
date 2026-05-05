-- Lightweight deal-interest signals (early “deal room” layer).

create table public.property_deal_interests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  user_role text,
  intent text not null
    constraint property_deal_interests_intent_check check (
      intent in ('acquire', 'invest', 'broker', 'partner')
    ),
  message text,
  created_at timestamptz not null default now()
);

create index property_deal_interests_property_id_idx
  on public.property_deal_interests (property_id);

create index property_deal_interests_user_id_idx
  on public.property_deal_interests (user_id);

create index property_deal_interests_created_at_idx
  on public.property_deal_interests (created_at desc);

alter table public.property_deal_interests enable row level security;

-- Submit interest only on properties you own (current Aervara model).
create policy "property_deal_interests_insert_own_property"
  on public.property_deal_interests for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
    )
  );

create policy "property_deal_interests_select_own"
  on public.property_deal_interests for select
  using (auth.uid() = user_id);

create policy "property_deal_interests_delete_own"
  on public.property_deal_interests for delete
  using (auth.uid() = user_id);
