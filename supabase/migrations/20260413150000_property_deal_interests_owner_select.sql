-- Property owners can read all deal-interest rows on their parcels (internal Deal Room).

drop policy if exists "property_deal_interests_select_own"
  on public.property_deal_interests;

create policy "property_deal_interests_select_owner_or_submitter"
  on public.property_deal_interests for select
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
    )
  );
