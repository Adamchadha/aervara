/**
 * Deal Memo — acquisition-style snapshot derived from parcel + engine signals.
 * Pure functions; no persistence.
 */
import type { PropertyRow } from "@/types/property";
import { formatMoney } from "@/lib/far-calculations";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";
import {
  getOpportunityEngineRead,
  getZoningFlags,
  type OpportunityEngineRead,
} from "@/lib/opportunity-engine";

function clamp(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.min(hi, Math.max(lo, n));
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function oppIndex(opp: number | null): number {
  if (opp == null || !Number.isFinite(opp) || opp <= 0) return 0;
  const x = Math.log10(opp + 1);
  return clamp((x / 9) * 100, 0, 100);
}

export type SuggestedNextStep =
  | "Run full underwriting"
  | "Verify zoning assumptions"
  | "Test construction pricing"
  | "Prioritize for broker outreach"
  | "Hold / monitor";

export type DealMemo = {
  executiveSummary: string;
  whyItMatters: string[];
  keyRisks: string[];
  suggestedNextStep: SuggestedNextStep;
};

function pickSuggestedNextStep(args: {
  oppI: number;
  ub: number;
  complexityScore: number;
  speedScore: number;
  mixedUse: boolean;
  unknownZoning: boolean;
  headroomRatio: number;
  hasRate: boolean;
}): SuggestedNextStep {
  const {
    oppI,
    ub,
    complexityScore,
    speedScore,
    mixedUse,
    unknownZoning,
    headroomRatio,
    hasRate,
  } = args;

  if (ub < 26 && oppI < 16) {
    return "Hold / monitor";
  }
  if (ub < 34 && oppI < 20 && complexityScore > 58) {
    return "Hold / monitor";
  }

  if (unknownZoning) {
    return "Verify zoning assumptions";
  }
  if (mixedUse && complexityScore >= 44) {
    return "Verify zoning assumptions";
  }
  if (headroomRatio > 0.78 && complexityScore >= 68) {
    return "Verify zoning assumptions";
  }

  if (oppI >= 42 && speedScore >= 64 && complexityScore <= 56) {
    return "Run full underwriting";
  }
  if (ub >= 60 && oppI >= 30 && complexityScore <= 52) {
    return "Run full underwriting";
  }

  if (oppI >= 28 && complexityScore >= 62 && hasRate) {
    return "Test construction pricing";
  }
  if (oppI >= 22 && complexityScore >= 70) {
    return "Test construction pricing";
  }

  if (oppI >= 36 && speedScore >= 58 && ub >= 48 && complexityScore < 68) {
    return "Prioritize for broker outreach";
  }
  if (oppI >= 32 && ub >= 55 && speedScore >= 50 && !mixedUse) {
    return "Prioritize for broker outreach";
  }

  if (speedScore < 40 && oppI < 30) {
    return "Hold / monitor";
  }

  if (ub >= 40 && oppI >= 24) {
    return "Run full underwriting";
  }

  return "Verify zoning assumptions";
}

function buildExecutiveSummary(args: {
  address: string;
  city: string;
  state: string;
  read: OpportunityEngineRead;
  ub: number;
  oppI: number;
  opportunityValue: number | null;
  unusedSqft: number;
  headroomRatio: number;
  mixedUse: boolean;
  suggestedNextStep: SuggestedNextStep;
}): string {
  const loc = `${args.city}, ${args.state}`.trim();
  const oppLine =
    args.opportunityValue != null && args.opportunityValue > 0
      ? `Modeled opportunity value of ${formatMoney(args.opportunityValue)} frames meaningful unused buildable upside relative to the as-of-right envelope.`
      : "Dollar upside is not yet anchored to a rate per buildable square foot—treat FAR slack as directional until underwriting fills in the revenue stack.";

  const path =
    args.suggestedNextStep === "Hold / monitor"
      ? "The near-term path is watchful: refresh comps periodically unless zoning or market conditions materially improve."
      : args.suggestedNextStep === "Verify zoning assumptions"
        ? "The likely path is diligence-heavy: pin down entitlement, use, and layering assumptions before sizing capital or schedule."
        : args.suggestedNextStep === "Test construction pricing"
          ? "Execution hinges on hard and soft costs—pressure-test pricing and delivery assumptions against a realistic phasing plan."
          : args.suggestedNextStep === "Prioritize for broker outreach"
            ? "The story is strong enough to socialize: align with capital partners or brokers while underwriting catches up on detail."
            : "With balanced risk and reward, this profile supports a full underwriting pass to convert screening conviction into an actionable IC memo.";

  const matter =
    args.ub >= 55 && args.headroomRatio >= 0.42
      ? `${args.address} in ${loc} stands out as a materially underbuilt parcel with headroom under current FAR.`
      : args.ub >= 36
        ? `${args.address} in ${loc} offers selective development upside under the modeled zoning read.`
        : `${args.address} in ${loc} is closer to built-out under the modeled envelope, so incremental value is more nuanced.`;

  return `${matter} ${oppLine} ${path}`;
}

function buildWhyItMatters(args: {
  read: OpportunityEngineRead;
  ub: number;
  oppI: number;
  opportunityValue: number | null;
  unusedSqft: number;
  headroomRatio: number;
  mixedUse: boolean;
  speedScore: number;
}): string[] {
  const bullets: string[] = [];

  if (args.ub >= 52) {
    bullets.push(
      `Underbuilt score of ${Math.round(args.ub)}% signals meaningful slack versus modeled zoning capacity—useful for ranking against peer sites.`,
    );
  } else if (args.ub >= 34) {
    bullets.push(
      "Moderate underbuilt positioning still leaves room for targeted infill or expansion if execution is tight.",
    );
  }

  if (
    args.opportunityValue != null &&
    args.opportunityValue > 0 &&
    args.oppI >= 22
  ) {
    bullets.push(
      `${formatMoney(args.opportunityValue)} of implied opportunity value ties unused buildable area to a rate assumption worth stress-testing.`,
    );
  }

  if (args.unusedSqft >= 6_000) {
    bullets.push(
      `${args.unusedSqft.toLocaleString("en-US")} sq ft of unused buildable area gives designers and capital partners a tangible envelope to optimize.`,
    );
  } else if (args.headroomRatio >= 0.45) {
    bullets.push(
      "Remaining FAR as a share of cap is healthy—scenario modeling can focus on vertical or horizontal expansion without assuming a rezoning miracle.",
    );
  }

  if (args.mixedUse) {
    bullets.push(
      "Mixed-use zoning expands exit scenarios (residential, retail, office blends) if entitlement bandwidth matches the ambition.",
    );
  }

  if (args.speedScore >= 62 && bullets.length < 3) {
    bullets.push(
      "Speed-to-value reads relatively fast for this profile—useful when allocating scarce partner time across a pipeline.",
    );
  }

  if (bullets.length < 3) {
    bullets.push(
      `Screening play: ${args.read.recommendedPlay.toLowerCase()}`,
    );
  }

  return bullets.slice(0, 3);
}

function buildKeyRisks(args: {
  read: OpportunityEngineRead;
  ub: number;
  oppI: number;
  complexityScore: number;
  speedScore: number;
  mixedUse: boolean;
  unknownZoning: boolean;
  hasRate: boolean;
  headroomRatio: number;
}): string[] {
  const risks: string[] = [];

  if (args.unknownZoning) {
    risks.push(
      "Zoning district text is thin or ambiguous—do not rely on it for as-of-right conclusions until counsel or GIS confirms.",
    );
  }

  if (args.complexityScore >= 62) {
    risks.push(
      "Complexity score is elevated, implying longer entitlement, design, or capital stacks than a clean infill prototype.",
    );
  } else if (args.complexityScore >= 48 && args.mixedUse) {
    risks.push(
      "Mixed-use layering often adds process risk—community input, parking, and loading can all stretch timelines.",
    );
  }

  if (args.speedScore < 42) {
    risks.push(
      "Speed-to-value is slow relative to peers—carry costs and market drift matter more than on a fast-cycle site.",
    );
  }

  if (!args.hasRate && args.oppI < 20 && risks.length < 3) {
    risks.push(
      "Without a modeled $/buildable sf, opportunity value is opaque—underwriting may reset rank once a rate is pinned.",
    );
  }

  if (args.headroomRatio < 0.28 && args.ub < 40 && risks.length < 3) {
    risks.push(
      "Limited remaining FAR versus cap tightens the development story—upside may depend on operational yield or option value.",
    );
  }

  if (risks.length === 0) {
    risks.push(
      "Screening-only read: confirm parking, utilities, and capital availability before treating upside as base case.",
    );
  }

  return risks.slice(0, 3);
}

/**
 * Acquisition-style deal memo for a property (uses same inputs as the opportunity engine).
 * Pass `cachedEngineRead` when you already called `getOpportunityEngineRead` to avoid duplicate work.
 */
export function getDealMemo(
  p: PropertyRow,
  cachedEngineRead?: OpportunityEngineRead,
): DealMemo {
  const m = getDisplayMetricsForRow(p);
  const read = cachedEngineRead ?? getOpportunityEngineRead(p);
  const lot = num(p.lot_size_sqft);
  const maxF = num(p.max_far);
  const ub = clamp(m.underbuilt_score, 0, 100);
  const { mixedUse, unknownOrAmbiguous } = getZoningFlags(p.zoning_district);
  const estRate =
    p.estimated_value_per_sqft == null ? null : num(p.estimated_value_per_sqft);
  const hasRate =
    estRate != null && Number.isFinite(estRate) && estRate > 0;
  const oppI = oppIndex(m.opportunity_value);
  const headroom =
    maxF > 0 ? clamp(m.remaining_far, 0, maxF * 2) / maxF : 0;

  const suggestedNextStep = pickSuggestedNextStep({
    oppI,
    ub,
    complexityScore: read.complexityScore,
    speedScore: read.speedToValueScore,
    mixedUse,
    unknownZoning: unknownOrAmbiguous,
    headroomRatio: headroom,
    hasRate,
  });

  const executiveSummary = buildExecutiveSummary({
    address: p.address,
    city: p.city,
    state: p.state,
    read,
    ub,
    oppI,
    opportunityValue: m.opportunity_value,
    unusedSqft: m.unused_buildable_sqft,
    headroomRatio: headroom,
    mixedUse,
    suggestedNextStep,
  });

  const whyItMatters = buildWhyItMatters({
    read,
    ub,
    oppI,
    opportunityValue: m.opportunity_value,
    unusedSqft: m.unused_buildable_sqft,
    headroomRatio: headroom,
    mixedUse,
    speedScore: read.speedToValueScore,
  });

  const keyRisks = buildKeyRisks({
    read,
    ub,
    oppI,
    complexityScore: read.complexityScore,
    speedScore: read.speedToValueScore,
    mixedUse,
    unknownZoning: unknownOrAmbiguous,
    hasRate,
    headroomRatio: headroom,
  });

  return {
    executiveSummary,
    whyItMatters,
    keyRisks,
    suggestedNextStep,
  };
}
