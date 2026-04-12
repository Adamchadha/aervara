-- Acquisition pipeline status per property

alter table public.properties
  add column if not exists status text not null default 'New';

alter table public.properties
  drop constraint if exists properties_status_check;

alter table public.properties
  add constraint properties_status_check
  check (status in ('New', 'Reviewing', 'Priority', 'Passed'));

create index if not exists properties_user_status_idx
  on public.properties (user_id, status);
