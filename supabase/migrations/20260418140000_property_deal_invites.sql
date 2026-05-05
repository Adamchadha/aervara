-- Invites to collaborate on a property deal (stored invites; optional simulated “send” timestamp).

create table public.property_deal_invites (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  inviter_user_id uuid not null references auth.users (id) on delete cascade,
  invitee_email text not null,
  invitee_role text not null
    constraint property_deal_invites_role_check check (
      invitee_role in ('investor', 'developer', 'broker')
    ),
  message text,
  email_simulated_at timestamptz,
  created_at timestamptz not null default now()
);

create index property_deal_invites_property_id_idx
  on public.property_deal_invites (property_id);

create index property_deal_invites_inviter_idx
  on public.property_deal_invites (inviter_user_id);

create index property_deal_invites_created_at_idx
  on public.property_deal_invites (created_at desc);

alter table public.property_deal_invites enable row level security;

create policy "property_deal_invites_insert_own_property"
  on public.property_deal_invites for insert
  with check (
    auth.uid() = inviter_user_id
    and exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
    )
  );

create policy "property_deal_invites_select_own_property"
  on public.property_deal_invites for select
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
    )
  );

create policy "property_deal_invites_delete_own_property"
  on public.property_deal_invites for delete
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
    )
  );
