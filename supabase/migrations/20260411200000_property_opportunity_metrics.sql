-- Investor MVP: opportunity metrics and value inputs (preserves existing rows)

alter table public.properties
  add column if not exists estimated_value_per_sqft numeric,
  add column if not exists opportunity_value numeric,
  add column if not exists current_built_far numeric,
  add column if not exists remaining_far numeric,
  add column if not exists unused_buildable_sqft numeric,
  add column if not exists underbuilt_score numeric;

-- Backfill from existing geometry / FAR columns
update public.properties
set
  current_built_far = case
    when lot_size_sqft > 0 then built_floor_area_sqft / lot_size_sqft
    else 0
  end,
  remaining_far = greatest(
    0,
    max_far - case
      when lot_size_sqft > 0 then built_floor_area_sqft / lot_size_sqft
      else 0
    end
  ),
  unused_buildable_sqft = greatest(
    0,
    (lot_size_sqft * max_far) - built_floor_area_sqft
  ),
  underbuilt_score = case
    when max_far > 0 then round(
      (
        (
          max_far - case
            when lot_size_sqft > 0 then built_floor_area_sqft / lot_size_sqft
            else 0
          end
        )
        / max_far
      ) * 100
    )
    else 0
  end
where current_built_far is null;
