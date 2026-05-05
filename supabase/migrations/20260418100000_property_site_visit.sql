-- Site Visit Mode: field checklist, visit stamp, and visit-specific notes on properties.

alter table public.properties
  add column if not exists site_visited_at timestamptz;

alter table public.properties
  add column if not exists site_visit_notes text;

alter table public.properties
  add column if not exists site_visit_checklist jsonb not null default '{}'::jsonb;

comment on column public.properties.site_visited_at is 'When the owner last marked an in-person site visit complete.';
comment on column public.properties.site_visit_notes is 'Short field notes for site visits (separate from general property notes).';
comment on column public.properties.site_visit_checklist is 'JSON map of checklist item id -> boolean.';
