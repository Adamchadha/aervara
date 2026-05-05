-- Building/Data Input submission pipeline flags.

alter table public.properties
  add column if not exists user_submitted boolean not null default false,
  add column if not exists needs_verification boolean not null default false,
  add column if not exists approved_by_admin boolean not null default false,
  add column if not exists approved_at timestamptz;

create index if not exists properties_user_submitted_idx
  on public.properties (user_submitted, user_id, created_at desc);

create index if not exists properties_needs_verification_idx
  on public.properties (needs_verification, approved_by_admin, created_at desc);

