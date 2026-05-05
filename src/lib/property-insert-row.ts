import {
  computeOpportunityMetrics,
  toStoredDerivedFields,
} from "@/lib/far-calculations";
import type { ParsedProperty } from "@/lib/property-form-schema";
import { inferMaxFarFromZoning } from "@/lib/zoning-max-far";

/** Shared insert payload for `properties` (server actions + seed scripts). */
export function buildPropertyInsertRow(data: ParsedProperty, userId: string) {
  const {
    notes,
    estimated_value_per_sqft,
    construction_cost_per_sqft,
    soft_cost_percentage,
    exit_value_per_sqft,
    ...rest
  } = data;
  const resolvedMaxFar = rest.max_far ?? inferMaxFarFromZoning(rest.zoning_district);

  const metrics = computeOpportunityMetrics(
    rest.lot_size_sqft,
    rest.built_floor_area_sqft,
    resolvedMaxFar,
    estimated_value_per_sqft,
  );
  const derived = toStoredDerivedFields(metrics);

  return {
    ...rest,
    max_far: resolvedMaxFar,
    notes: notes?.trim() ? notes.trim() : null,
    estimated_value_per_sqft,
    construction_cost_per_sqft,
    soft_cost_percentage,
    exit_value_per_sqft,
    opportunity_value: derived.opportunity_value,
    current_built_far: derived.current_built_far,
    remaining_far: derived.remaining_far,
    unused_buildable_sqft: derived.unused_buildable_sqft,
    underbuilt_score: derived.underbuilt_score,
    user_submitted: true,
    needs_verification: true,
    approved_by_admin: null,
    approved_at: null,
    user_id: userId,
  };
}
