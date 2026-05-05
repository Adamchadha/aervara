-- Project files / references for property Site Room (links + notes; uploads later).

create table public.property_project_files (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null
    constraint property_project_files_category_check check (
      category in (
        'floor_plan',
        'zoning_notes',
        'underwriting_notes',
        'concept_visuals',
        'document'
      )
    ),
  title text not null,
  link_url text,
  notes text,
  created_at timestamptz not null default now(),
  constraint property_project_files_link_url_http_check check (
    link_url is null
    or link_url ~* '^https?://'
  )
);

create index property_project_files_property_id_idx
  on public.property_project_files (property_id);

create index property_project_files_property_category_idx
  on public.property_project_files (property_id, category);

create index property_project_files_created_at_idx
  on public.property_project_files (created_at desc);

alter table public.property_project_files enable row level security;

create policy "property_project_files_insert_own_property"
  on public.property_project_files for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
    )
  );

create policy "property_project_files_select_own_property"
  on public.property_project_files for select
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
    )
  );

create policy "property_project_files_delete_own_property"
  on public.property_project_files for delete
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
    )
  );

create policy "property_project_files_update_own_property"
  on public.property_project_files for update
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.user_id = auth.uid()
    )
  );
