-- Stripe billing: customer id, subscription status, product tier on `membership_tier` (free | pro | elite).
-- Premium inventory flag on properties (Elite-only visibility in app).

alter table public.user_profiles
  add column if not exists stripe_customer_id text,
  add column if not exists subscription_status text;

-- Map legacy network-style tiers to billing tiers (one-time).
update public.user_profiles
set membership_tier = case membership_tier
  when 'standard' then 'free'
  when 'curated' then 'pro'
  when 'verified' then 'elite'
  when 'invited' then 'elite'
  else membership_tier
end
where membership_tier in ('standard', 'curated', 'verified', 'invited');

update public.user_profiles
set membership_tier = 'free'
where membership_tier is null
   or membership_tier not in ('free', 'pro', 'elite');

alter table public.user_profiles
  alter column membership_tier set default 'free';

alter table public.properties
  add column if not exists is_premium boolean not null default false;

alter table public.user_profiles
  drop constraint if exists user_profiles_membership_tier_check;

alter table public.user_profiles
  add constraint user_profiles_membership_tier_check check (
    membership_tier is null
    or membership_tier in ('free', 'pro', 'elite')
  );

create index if not exists user_profiles_stripe_customer_id_idx
  on public.user_profiles (stripe_customer_id)
  where stripe_customer_id is not null;
