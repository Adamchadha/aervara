import { buildAmenityScenarios } from "@/lib/amenity-activation";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import type { PropertyRow } from "@/types/property";

export type OpportunityPriorityLabel =
  | "High Priority"
  | "Strong"
  | "Moderate"
  | "Low";

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function scaleByMax(v: number, max: number): number {
  if (!Number.isFinite(v) || !Number.isFinite(max) || max <= 0) return 0;
  return clamp01(v / max);
}

export function opportunityPriorityLabel(score: number): OpportunityPriorityLabel {
  if (score >= 80) return "High Priority";
  if (score >= 60) return "Strong";
  if (score >= 40) return "Moderate";
  return "Low";
}

type FeatureSet = {
  underbuilt: number;
  opportunityValue: number;
  unusedBuildableSqft: number;
  amenityStrength: number;
};

function featureSet(p: PropertyRow): FeatureSet {
  const m = getDisplayMetricsForRow(p);
  const unused = Math.max(0, Number(m.unused_buildable_sqft) || 0);
  const totalBuildable = Math.max(0, (Number(p.lot_size_sqft) || 0) * (Number(p.max_far) || 0));
  const scenarios = buildAmenityScenarios({
    unusedBuildableSqft: unused,
    totalBuildableSqft: totalBuildable,
  });
  const amenityStrength = scenarios.reduce((best, s) => {
    const midNoi = (s.yield.annualNoiUpliftLow + s.yield.annualNoiUpliftHigh) / 2;
    return Math.max(best, midNoi);
  }, 0);

  return {
    underbuilt: Math.max(0, Math.min(100, Number(m.underbuilt_score) || 0)),
    opportunityValue: Math.max(0, Number(m.opportunity_value) || 0),
    unusedBuildableSqft: unused,
    amenityStrength: Math.max(0, amenityStrength),
  };
}

/** Dataset-aware 0-100 score for dashboard ranking and comparison. */
export function computeOpportunityScores(properties: PropertyRow[]): Map<string, number> {
  const rows = properties.map((p) => ({ id: p.id, f: featureSet(p) }));
  const maxOpportunity = Math.max(...rows.map((r) => r.f.opportunityValue), 1);
  const maxUnused = Math.max(...rows.map((r) => r.f.unusedBuildableSqft), 1);
  const maxAmenity = Math.max(...rows.map((r) => r.f.amenityStrength), 1);

  const out = new Map<string, number>();
  for (const r of rows) {
    const underbuiltNorm = clamp01(r.f.underbuilt / 100);
    const valueNorm = scaleByMax(r.f.opportunityValue, maxOpportunity);
    const unusedNorm = scaleByMax(r.f.unusedBuildableSqft, maxUnused);
    const amenityNorm = scaleByMax(r.f.amenityStrength, maxAmenity);

    const weighted =
      underbuiltNorm * 0.4 +
      valueNorm * 0.3 +
      unusedNorm * 0.2 +
      amenityNorm * 0.1;
    out.set(r.id, Math.round(weighted * 100));
  }
  return out;
}

/** Single-row fallback score when no dataset context is available. */
export function computeOpportunityScoreForProperty(p: PropertyRow): number {
  const f = featureSet(p);
  const underbuiltNorm = clamp01(f.underbuilt / 100);
  const valueNorm = clamp01(Math.log10(f.opportunityValue + 1) / 8);
  const unusedNorm = clamp01(Math.log10(f.unusedBuildableSqft + 1) / 5);
  const amenityNorm = clamp01(Math.log10(f.amenityStrength + 1) / 7);
  const weighted =
    underbuiltNorm * 0.4 +
    valueNorm * 0.3 +
    unusedNorm * 0.2 +
    amenityNorm * 0.1;
  return Math.round(weighted * 100);
}
