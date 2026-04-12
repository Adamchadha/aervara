/**
 * Aervara Opportunity Engine — heuristic investment read from parcel metrics.
 * All outputs are derived at read time (no DB columns required).
 */
import type { PropertyRow } from "@/types/property";
import { getDisplayMetricsForRow } from "@/lib/property-display-metrics";

function clamp(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.min(hi, Math.max(lo, n));
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export type ComplexityBand = "low" | "medium" | "high";
export type SpeedBand = "slower" | "moderate" | "fast";

export type OpportunityEngineRead = {
  complexityScore: number;
  complexityBand: ComplexityBand;
  complexityLabel: string;
  speedToValueScore: number;
  speedBand: SpeedBand;
  speedToValueLabel: string;
  recommendedPlay: string;
  opportunitySummary: string;
  keyFlags: string[];
};

function zoningSignals(zoning: string): {
  mixedUse: boolean;
  unknownOrAmbiguous: boolean;
} {
  const z = zoning.trim().toLowerCase();
  const mixedUse =
    /\b(mxd|mixed|mixed[-\s]?use|m\/u|mu-|c\d[-\d]*\/r|r\d[-\d]*\/c|commercial\/res|res\/com)\b/i.test(
      z,
    ) || z.includes("mixed use") || z.includes("mixed-use");
  const unknownOrAmbiguous =
    z.length < 2 ||
    /\b(unknown|tbd|n\/a|na|pending|general|various)\b/i.test(z) ||
    z === "—";
  return { mixedUse, unknownOrAmbiguous };
}

function complexityBandFromScore(score: number): ComplexityBand {
  if (score <= 33) return "low";
  if (score <= 66) return "medium";
  return "high";
}

function speedBandFromScore(score: number): SpeedBand {
  if (score <= 33) return "slower";
  if (score <= 66) return "moderate";
  return "fast";
}

function bandLabelComplexity(band: ComplexityBand): string {
  if (band === "low") return "Low complexity";
  if (band === "medium") return "Medium complexity";
  return "High complexity";
}

function bandLabelSpeed(band: SpeedBand): string {
  if (band === "slower") return "Slower";
  if (band === "moderate") return "Moderate";
  return "Fast";
}

/**
 * Normalize implied opportunity $ to 0–100 for heuristics (caps mega values).
 */
function opportunityValueIndex(opp: number | null): number {
  if (opp == null || !Number.isFinite(opp) || opp <= 0) return 0;
  const x = Math.log10(opp + 1);
  return clamp((x / 9) * 100, 0, 100);
}

/** Model rate $/buildable sf → 0–100 for heuristics (typical underwriting range). */
function estimatedValuePerSqftIndex(
  rateUsdPerSf: number | null | undefined,
): number {
  if (rateUsdPerSf == null || !Number.isFinite(rateUsdPerSf) || rateUsdPerSf <= 0) {
    return 0;
  }
  const x = Math.log10(rateUsdPerSf + 1);
  return clamp((x / 3.45) * 100, 0, 100);
}

/**
 * Complexity (0–100): higher = harder / more friction to execute.
 * - Strong underbuilt headroom lowers complexity (cleaner upside story).
 * - Very large remaining FAR vs max adds entitlement / delivery friction.
 * - Mixed-use or ambiguous zoning adds process risk.
 * - Already-high built FAR vs max lowers execution complexity but also caps upside.
 * - Strong modeled $/sf + meaningful opportunity slightly lowers complexity (clearer revenue story).
 * - Nearly built-out + weak implied value: marginal monetization (slightly higher complexity).
 */
export function computeComplexityScore(args: {
  underbuiltScore: number;
  remainingFar: number;
  maxFar: number;
  currentBuiltFar: number;
  zoningDistrict: string;
  opportunityValueIndex: number;
  estimatedValuePerSqft: number | null;
}): number {
  const { mixedUse, unknownOrAmbiguous } = zoningSignals(args.zoningDistrict);
  const oppI = clamp(args.opportunityValueIndex, 0, 100);
  const rateI = estimatedValuePerSqftIndex(args.estimatedValuePerSqft);
  let c = 52;

  c -= (clamp(args.underbuiltScore, 0, 100) / 100) * 34;

  const maxF = Math.max(0, args.maxFar);
  const headroom = maxF > 0 ? clamp(args.remainingFar, 0, maxF) / maxF : 0;
  if (headroom > 0.72) {
    c += (headroom - 0.72) * 55;
  }
  if (headroom > 0.88) {
    c += 6;
  }

  if (mixedUse) c += 14;
  if (unknownOrAmbiguous) c += 10;

  const util = maxF > 0 ? clamp(args.currentBuiltFar, 0, maxF * 2) / maxF : 0;
  if (util > 0.88) c -= 10;
  if (util < 0.22) c += 6;

  if (rateI > 38 && oppI > 28) {
    c -= 5;
  }
  if (util > 0.85 && args.underbuiltScore < 38 && oppI < 20) {
    c += 8;
  }
  if (oppI < 12 && args.underbuiltScore < 44) {
    c += 4;
  }

  return Math.round(clamp(c, 0, 100));
}

/**
 * Speed-to-value (0–100): higher = faster path to monetizing the story.
 */
export function computeSpeedToValueScore(args: {
  underbuiltScore: number;
  complexityScore: number;
  opportunityValue: number | null;
  estimatedValuePerSqft: number | null;
}): number {
  const ub = clamp(args.underbuiltScore, 0, 100);
  const comp = clamp(args.complexityScore, 0, 100);
  const oppI = opportunityValueIndex(args.opportunityValue);
  const rateI = estimatedValuePerSqftIndex(args.estimatedValuePerSqft);

  let s = 22;
  s += (ub / 100) * 38;
  s += ((100 - comp) / 100) * 28;
  const dampen = comp > 78 ? 0.55 : comp > 62 ? 0.82 : 1;
  s += oppI * 0.22 * dampen;
  if (comp < 72) {
    s += rateI * 0.1;
  }

  return Math.round(clamp(s, 0, 100));
}

function pickRecommendedPlay(args: {
  underbuiltScore: number;
  opportunityValue: number | null;
  mixedUse: boolean;
  speedBand: SpeedBand;
  complexityBand: ComplexityBand;
  maxFar: number;
  currentBuiltFar: number;
}): string {
  const ub = args.underbuiltScore;
  const oppI = opportunityValueIndex(args.opportunityValue);
  const maxF = Math.max(0, args.maxFar);
  const util =
    maxF > 0 ? clamp(args.currentBuiltFar, 0, maxF * 2) / maxF : 0;

  if (util > 0.9 && ub < 38 && oppI < 22) {
    return "Lower-upside hold / monitor site";
  }
  if (ub < 24 && oppI < 14) {
    return "Lower-upside hold / monitor site";
  }

  if (args.mixedUse && ub >= 42 && oppI >= 28) {
    return "Strong mixed-use repositioning opportunity";
  }
  if (args.mixedUse && ub >= 28) {
    return "Mixed-use infill or layered-use candidate";
  }
  if (ub >= 68 && oppI >= 45) {
    return "High-upside multifamily infill candidate";
  }
  if (ub >= 55 && oppI >= 32) {
    return "Strong residential or multifamily infill candidate";
  }
  if (ub >= 40 && oppI >= 22) {
    return "Moderate add-on development play";
  }
  if (ub >= 28 || oppI >= 18) {
    return "Selective development or expansion opportunity";
  }
  if (args.complexityBand === "high" && args.speedBand === "slower") {
    return "Long-cycle entitlement or capital-intensive play";
  }
  return "Lower-upside hold / monitor site";
}

/**
 * One tight investment-style paragraph (screening thesis + diligence hook).
 */
function buildOpportunitySummary(args: {
  underbuiltScore: number;
  unusedSqft: number;
  lotSqft: number;
  opportunityValue: number | null;
  remainingFar: number;
  maxFar: number;
  mixedUse: boolean;
  estimatedValuePerSqft: number | null;
}): string {
  const ub = clamp(args.underbuiltScore, 0, 100);
  const maxF = Math.max(0, args.maxFar);
  const headroom = maxF > 0 ? clamp(args.remainingFar, 0, maxF * 2) / maxF : 0;
  const lot = Math.max(1, args.lotSqft);
  const unused = Math.max(0, args.unusedSqft);
  const envelope = lot * maxF;
  const unusedShare = envelope > 0 ? unused / envelope : 0;
  const hasOpp =
    args.opportunityValue != null &&
    Number.isFinite(args.opportunityValue) &&
    args.opportunityValue > 0;
  const hasRate =
    args.estimatedValuePerSqft != null &&
    Number.isFinite(args.estimatedValuePerSqft) &&
    args.estimatedValuePerSqft > 0;

  const thesis =
    ub >= 65 && headroom >= 0.5
      ? "The parcel reads meaningfully under its modeled zoning ceiling with durable FAR headroom, making it a natural candidate for disciplined infill or expansion underwriting."
      : ub >= 42 && headroom >= 0.35
        ? "There is moderate slack between built intensity and modeled FAR, suggesting a credible incremental density or targeted add-on narrative rather than a pure land-bank play."
        : ub >= 28
          ? "Zoning capacity still offers selective upside, but the underbuilt signal is closer to marginal—conviction will depend on micro-location, timing, and execution detail."
          : "Built form is relatively tight to the modeled FAR limit, so the story is less about raw unused envelope and more about yield, operations, or long-dated option value.";

  const economics = hasOpp
    ? hasRate
      ? "Implied opportunity value under the on-file rate assumption is large enough to warrant stress-testing rents, exit caps, and construction pricing before treating upside as base case."
      : "Implied opportunity value from unused buildable area is non-zero; anchoring a defensible rate per buildable square foot will clarify how much of that upside is monetizable."
    : "Add an estimated value per buildable square foot to translate FAR slack into a dollar thesis alongside the qualitative read.";

  const footprint =
    headroom > 0.52 && unusedShare > 0.32 && unused >= 5_000
      ? "Remaining FAR and unused square footage are both material on this footprint—early underwriting should treat the site as having real envelope to work with."
      : unused >= 12_000
        ? "Absolute unused buildable square footage is sizable, which supports a deeper look at vertical or horizontal expansion scenarios even when FAR ratios look moderate."
        : "Screening math is only as good as the zoning narrative—confirm as-of-right assumptions, parking, utilities, and capital constraints before locking a playbook.";

  const zoning = args.mixedUse
    ? "Mixed-use or layered-use zoning widens scenario breadth but usually lengthens entitlement and design paths; plan timelines accordingly."
    : "";

  const out = [thesis, economics, footprint, zoning].filter(Boolean).join(" ");
  return out;
}

function buildKeyFlags(args: {
  underbuiltScore: number;
  unusedSqft: number;
  lotSqft: number;
  maxFar: number;
  remainingFar: number;
  mixedUse: boolean;
  complexityBand: ComplexityBand;
  speedBand: SpeedBand;
  opportunityValue: number | null;
  estimatedValuePerSqft: number | null;
}): string[] {
  const flags: string[] = [];
  const maxF = Math.max(0.001, args.maxFar);
  const farGapRatio = clamp(args.remainingFar, 0, maxF * 2) / maxF;

  if (farGapRatio >= 0.45) flags.push("Large FAR gap");
  const lot = Math.max(1, args.lotSqft);
  if (args.unusedSqft >= 8_000 || args.unusedSqft / lot >= 0.35) {
    flags.push("High unused square footage");
  }
  if (args.mixedUse) flags.push("Mixed-use zoning");
  if (args.complexityBand === "high") flags.push("Higher complexity");
  else if (args.complexityBand === "medium") flags.push("Moderate complexity");
  else if (args.complexityBand === "low") flags.push("Cleaner execution profile");
  if (args.speedBand === "fast") flags.push("Fast path to value");
  else if (args.speedBand === "slower") flags.push("Slower value path");

  if (
    args.opportunityValue != null &&
    args.opportunityValue >= 2_500_000 &&
    !flags.includes("Fast path to value")
  ) {
    flags.push("Strong implied upside");
  }
  if (
    args.estimatedValuePerSqft != null &&
    args.estimatedValuePerSqft > 0 &&
    !flags.some((f) => f.includes("upside"))
  ) {
    flags.push("Rate assumption on file");
  }

  const uniq = [...new Set(flags)];
  if (uniq.length >= 4) return uniq.slice(0, 4);
  if (uniq.length >= 2) return uniq;
  if (uniq.length === 1) return [...uniq, "Screening-stage opportunity"];
  return ["Screening-stage opportunity", "Confirm zoning & assumptions"];
}

/**
 * Full “Aervara Opportunity Engine” read for a property row (pure, render-safe).
 */
export function getOpportunityEngineRead(p: PropertyRow): OpportunityEngineRead {
  const m = getDisplayMetricsForRow(p);
  const lot = num(p.lot_size_sqft);
  const maxF = num(p.max_far);
  const ub = clamp(m.underbuilt_score, 0, 100);
  const { mixedUse } = zoningSignals(p.zoning_district);
  const estRate =
    p.estimated_value_per_sqft == null
      ? null
      : num(p.estimated_value_per_sqft);
  const oppI = opportunityValueIndex(m.opportunity_value);

  const complexityScore = computeComplexityScore({
    underbuiltScore: ub,
    remainingFar: m.remaining_far,
    maxFar: maxF,
    currentBuiltFar: m.current_built_far,
    zoningDistrict: p.zoning_district,
    opportunityValueIndex: oppI,
    estimatedValuePerSqft: estRate,
  });
  const complexityBand = complexityBandFromScore(complexityScore);

  const speedToValueScore = computeSpeedToValueScore({
    underbuiltScore: ub,
    complexityScore,
    opportunityValue: m.opportunity_value,
    estimatedValuePerSqft: estRate,
  });
  const speedBand = speedBandFromScore(speedToValueScore);

  const recommendedPlay = pickRecommendedPlay({
    underbuiltScore: ub,
    opportunityValue: m.opportunity_value,
    mixedUse,
    speedBand,
    complexityBand,
    maxFar: maxF,
    currentBuiltFar: m.current_built_far,
  });

  const opportunitySummary = buildOpportunitySummary({
    underbuiltScore: ub,
    unusedSqft: m.unused_buildable_sqft,
    lotSqft: lot,
    opportunityValue: m.opportunity_value,
    remainingFar: m.remaining_far,
    maxFar: maxF,
    mixedUse,
    estimatedValuePerSqft: estRate,
  });

  const keyFlags = buildKeyFlags({
    underbuiltScore: ub,
    unusedSqft: m.unused_buildable_sqft,
    lotSqft: lot,
    maxFar: maxF,
    remainingFar: m.remaining_far,
    mixedUse,
    complexityBand,
    speedBand,
    opportunityValue: m.opportunity_value,
    estimatedValuePerSqft: estRate,
  });

  return {
    complexityScore,
    complexityBand,
    complexityLabel: bandLabelComplexity(complexityBand),
    speedToValueScore,
    speedBand,
    speedToValueLabel: bandLabelSpeed(speedBand),
    recommendedPlay,
    opportunitySummary,
    keyFlags,
  };
}
