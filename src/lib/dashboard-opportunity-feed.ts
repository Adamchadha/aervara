import { getOpportunityEngineRead } from "@/lib/opportunity-engine";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import type { PropertyRow } from "@/types/property";

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Highest modeled opportunity value ($); nulls sort last. */
export function selectTopByOpportunityValue(
  properties: PropertyRow[],
  limit: number,
): PropertyRow[] {
  if (properties.length === 0 || limit <= 0) return [];
  return [...properties]
    .sort((a, b) => {
      const ma = getDisplayMetricsForRow(a);
      const mb = getDisplayMetricsForRow(b);
      const oa = ma.opportunity_value;
      const ob = mb.opportunity_value;
      if (ob == null && oa == null) {
        return num(mb.underbuilt_score) - num(ma.underbuilt_score);
      }
      if (ob == null) return -1;
      if (oa == null) return 1;
      if (ob !== oa) return ob - oa;
      return num(mb.underbuilt_score) - num(ma.underbuilt_score);
    })
    .slice(0, limit);
}

/** Highest speed-to-value score (0–100). */
export function selectTopBySpeedToValue(
  properties: PropertyRow[],
  limit: number,
): PropertyRow[] {
  if (properties.length === 0 || limit <= 0) return [];
  return [...properties]
    .sort((a, b) => {
      const sa = getOpportunityEngineRead(a).speedToValueScore;
      const sb = getOpportunityEngineRead(b).speedToValueScore;
      if (sb !== sa) return sb - sa;
      return (
        getOpportunityEngineRead(a).complexityScore -
        getOpportunityEngineRead(b).complexityScore
      );
    })
    .slice(0, limit);
}

/** Lowest complexity score (0–100 = simpler / faster path). */
export function selectTopByLowestComplexity(
  properties: PropertyRow[],
  limit: number,
): PropertyRow[] {
  if (properties.length === 0 || limit <= 0) return [];
  return [...properties]
    .sort((a, b) => {
      const ca = getOpportunityEngineRead(a).complexityScore;
      const cb = getOpportunityEngineRead(b).complexityScore;
      if (ca !== cb) return ca - cb;
      return (
        getOpportunityEngineRead(b).speedToValueScore -
        getOpportunityEngineRead(a).speedToValueScore
      );
    })
    .slice(0, limit);
}
