import { computeOpportunityMetrics } from "@/lib/far-calculations";
import type { PropertyRow } from "@/types/property";

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export type PropertyDisplayMetrics = {
  current_built_far: number;
  remaining_far: number;
  /** UI alias for `remaining_far`. */
  unused_vertical_capacity: number;
  unused_buildable_sqft: number;
  underbuilt_score: number;
  opportunity_value: number | null;
  /** UI alias for `opportunity_value`. */
  air_rights_value: number | null;
};

/**
 * Prefer stored DB metrics; otherwise compute from base fields (legacy rows).
 */
export function getDisplayMetricsForRow(
  p: PropertyRow,
): PropertyDisplayMetrics {
  const lot = num(p.lot_size_sqft);
  const built = num(p.built_floor_area_sqft);
  const maxF = num(p.max_far);
  const est =
    p.estimated_value_per_sqft == null
      ? null
      : num(p.estimated_value_per_sqft);

  const stored =
    p.current_built_far != null &&
    p.remaining_far != null &&
    p.unused_buildable_sqft != null &&
    p.underbuilt_score != null;

  if (stored) {
    return {
      current_built_far: num(p.current_built_far),
      remaining_far: num(p.remaining_far),
      unused_vertical_capacity: num(p.remaining_far),
      unused_buildable_sqft: num(p.unused_buildable_sqft),
      underbuilt_score: Math.round(num(p.underbuilt_score)),
      opportunity_value:
        p.opportunity_value == null ? null : Math.round(num(p.opportunity_value)),
      air_rights_value:
        p.opportunity_value == null ? null : Math.round(num(p.opportunity_value)),
    };
  }

  const m = computeOpportunityMetrics(lot, built, maxF, est);
  return {
    current_built_far: m.current_built_far,
    remaining_far: m.remaining_far,
    unused_vertical_capacity: m.remaining_far,
    unused_buildable_sqft: m.unused_buildable_sqft,
    underbuilt_score: m.underbuilt_score,
    opportunity_value: m.opportunity_value,
    air_rights_value: m.opportunity_value,
  };
}
