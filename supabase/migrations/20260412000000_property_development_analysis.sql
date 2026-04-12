-- Development analysis inputs (pro forma)

alter table public.properties
  add column if not exists construction_cost_per_sqft numeric,
  add column if not exists soft_cost_percentage numeric default 20,
  add column if not exists exit_value_per_sqft numeric;

update public.properties
set soft_cost_percentage = 20
where soft_cost_percentage is null;
