import { getDevelopmentAnalysisForProperty } from "@/lib/development-analysis";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import type { PropertyRow } from "@/types/property";

/**
 * Sort key: estimated development profit when computable; otherwise opportunity value.
 */
export function opportunityRankScore(p: PropertyRow): number {
  const { estimated_profit } = getDevelopmentAnalysisForProperty(p);
  if (estimated_profit != null && Number.isFinite(estimated_profit)) {
    return estimated_profit;
  }
  const { opportunity_value } = getDisplayMetricsForRow(p);
  if (opportunity_value != null && Number.isFinite(opportunity_value)) {
    return opportunity_value;
  }
  return Number.NEGATIVE_INFINITY;
}

export function selectTopOpportunities(
  properties: PropertyRow[],
  limit: number,
): PropertyRow[] {
  if (properties.length === 0 || limit <= 0) return [];
  return [...properties]
    .sort((a, b) => opportunityRankScore(b) - opportunityRankScore(a))
    .slice(0, limit);
}
