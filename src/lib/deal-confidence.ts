import { getOpportunityEngineRead } from "@/lib/opportunity-engine";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import type { PropertyRow } from "@/types/property";

function clamp(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.min(hi, Math.max(lo, n));
}

/** Same shape as the opportunity engine: log-scaled $ → 0–100. */
function opportunityStrength(opp: number | null): number {
  if (opp == null || !Number.isFinite(opp) || opp <= 0) return 0;
  const x = Math.log10(opp + 1);
  return clamp((x / 9) * 100, 0, 100);
}

export type DealConfidenceBand = "low" | "medium" | "high";

export type DealConfidence = {
  score: number;
  band: DealConfidenceBand;
  /** e.g. "High confidence" */
  label: string;
};

/**
 * Single 0–100 score from opportunity $, underbuilt %, inverse complexity, and
 * speed-to-value. Heuristic only.
 */
export function computeDealConfidence(args: {
  opportunityValue: number | null;
  underbuiltScore: number;
  complexityScore: number;
  speedToValueScore: number;
}): DealConfidence {
  const opp = opportunityStrength(args.opportunityValue);
  const ub = clamp(args.underbuiltScore, 0, 100);
  const simplicity = clamp(100 - args.complexityScore, 0, 100);
  const speed = clamp(args.speedToValueScore, 0, 100);

  const score = Math.round(
    0.3 * opp + 0.28 * ub + 0.22 * simplicity + 0.2 * speed,
  );
  const s = clamp(score, 0, 100);

  const band: DealConfidenceBand =
    s < 38 ? "low" : s < 66 ? "medium" : "high";
  const label =
    band === "low"
      ? "Low confidence"
      : band === "medium"
        ? "Medium confidence"
        : "High confidence";

  return { score: s, band, label };
}

export function getDealConfidence(property: PropertyRow): DealConfidence {
  const m = getDisplayMetricsForRow(property);
  const r = getOpportunityEngineRead(property);
  return computeDealConfidence({
    opportunityValue: m.opportunity_value,
    underbuiltScore: m.underbuilt_score,
    complexityScore: r.complexityScore,
    speedToValueScore: r.speedToValueScore,
  });
}
