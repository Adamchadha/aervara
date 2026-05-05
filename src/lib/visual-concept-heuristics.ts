import { computeFarMetrics } from "@/lib/far-calculations";
import { getZoningFlags } from "@/lib/opportunity-engine";
import type { OpportunityEngineRead } from "@/lib/opportunity-engine";
import type { PropertyDisplayMetrics } from "@/lib/property-display-metrics";
import type { PropertyRow } from "@/types/property";

export type VisualConceptSummary = {
  /** Tangible development archetype from parcel signals */
  suggestedBuildingType: string;
  /** Illustrative only */
  floorsApprox: number | null;
  unitsApprox: number | null;
  useMix: string | null;
  /** Why the model landed here — screening copy, not advice */
  rationale: string;
};

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** 0–100 from implied opportunity $ for rationale / tie-breaks */
function opportunityDollarIndex(valueUsd: number | null): number {
  if (valueUsd == null || !Number.isFinite(valueUsd) || valueUsd <= 0) return 0;
  const x = Math.log10(valueUsd + 1);
  return clamp((x / 9) * 100, 0, 100);
}

function compactSqft(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M sf`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k sf`;
  return `${Math.round(n).toLocaleString("en-US")} sf`;
}

type ConceptArchetype =
  | "hold_monitor"
  | "incremental"
  | "industrial"
  | "multifamily_infill"
  | "mixed_midrise"
  | "tower_candidate"
  | "redevelopment_default";

function classifyArchetype(args: {
  zoning: string;
  mixedUse: boolean;
  unknownZoning: boolean;
  maxFar: number;
  lotSqft: number;
  unusedBuildableSqft: number;
  remainingFarRatio: number;
  underbuiltScore: number;
  complexityScore: number;
  opportunityDollarIdx: number;
  play: string;
}): ConceptArchetype {
  const {
    mixedUse,
    unknownZoning,
    maxFar,
    lotSqft,
    unusedBuildableSqft,
    remainingFarRatio,
    underbuiltScore,
    complexityScore,
    opportunityDollarIdx,
    play,
  } = args;

  const lowUpside =
    underbuiltScore < 26 ||
    (unusedBuildableSqft < 3200 && remainingFarRatio < 0.2) ||
    (unusedBuildableSqft < 1800 && underbuiltScore < 40);

  const industrialPlay = /\b(industrial|warehouse|logistics|manufacturing)\b/i.test(
    play,
  );

  if (lowUpside) {
    if (complexityScore >= 62 && underbuiltScore < 32) return "hold_monitor";
    return "incremental";
  }

  if (industrialPlay && !mixedUse) return "industrial";

  const strongHeadroom = remainingFarRatio >= 0.42 && underbuiltScore >= 38;
  const highFar = maxFar >= 7.5 || (maxFar >= 6 && lotSqft >= 14_000);
  const towerFar = maxFar >= 9 || (maxFar >= 7.8 && lotSqft >= 18_000 && underbuiltScore >= 44);

  if (towerFar && strongHeadroom) return "tower_candidate";

  if (mixedUse && maxFar >= 3.8 && underbuiltScore >= 30) return "mixed_midrise";

  const residentialish =
    /\b(residential|multifamily|multi[-\s]?family|housing|apartment|condo|infill|mid[-\s]?rise|rm|rf|r\d)\b/i.test(
      play,
    ) || /\b(r|rm|res|mf|rd|rg)\d*\b/i.test(args.zoning);

  if (residentialish && !mixedUse && maxFar >= 2.2 && underbuiltScore >= 28) {
    return "multifamily_infill";
  }

  if (highFar && underbuiltScore >= 36 && !unknownZoning) return "tower_candidate";

  if (mixedUse && maxFar >= 3) return "mixed_midrise";

  return "redevelopment_default";
}

function labelForArchetype(
  arch: ConceptArchetype,
  play: string,
  mixedUse: boolean,
): string {
  switch (arch) {
    case "hold_monitor":
      return "Hold / monitor (limited envelope upside)";
    case "incremental":
      return "Light add-on, renovation, or incremental density";
    case "industrial":
      return "Industrial or logistics repositioning";
    case "multifamily_infill":
      return "Multifamily infill (moderate-rise stack)";
    case "mixed_midrise":
      return "Mixed-use mid-rise (street + upper floors)";
    case "tower_candidate":
      return "Tower or high-rise redevelopment candidate";
    default:
      return play.trim() || "Redevelopment candidate";
  }
}

function buildRationale(args: {
  archetype: ConceptArchetype;
  zoning: string;
  maxFar: number;
  lotSqft: number;
  unusedBuildableSqft: number;
  underbuiltScore: number;
  complexityScore: number;
  opportunityDollarIdx: number;
  hasOpportunityDollars: boolean;
  mixedUse: boolean;
}): string {
  const z = args.zoning.trim() || "Zoning TBD";
  const far = args.maxFar.toFixed(1);
  const unused = compactSqft(Math.max(0, args.unusedBuildableSqft));
  const opp = Math.round(clamp(args.underbuiltScore, 0, 100));
  const comp = Math.round(clamp(args.complexityScore, 0, 100));

  const oppNote =
    args.hasOpportunityDollars && args.opportunityDollarIdx >= 42
      ? " Modeled value uplift is meaningful on paper."
      : "";

  switch (args.archetype) {
    case "hold_monitor":
      return `${z} at ${far}× FAR shows thin remaining envelope (${unused} unused). Underbuilt signal ${opp}/100 with execution friction around ${comp}/100—often a watchlist or small-intervention story.${oppNote}`;
    case "incremental":
      return `${z} and ${far}× FAR leave modest slack (${unused} unused). Opportunity reads ${opp}/100—think surgical add-on, lease-up, or phased capital rather than a full scrape.${oppNote}`;
    case "industrial":
      return `${z} with ${far}× FAR favors broad-floor industrial or logistics economics on this ${compactSqft(args.lotSqft)} lot. Underbuilt ${opp}/100; complexity ${comp}/100 shapes timing and capital intensity.${oppNote}`;
    case "multifamily_infill":
      return `Residential-weighted ${z} at ${far}× FAR supports stacked dwelling units where entitlements allow—${unused} unused buildable sf backs additional floors. Opportunity ${opp}/100; complexity ${comp}/100.${oppNote}`;
    case "mixed_midrise":
      return args.mixedUse
        ? `Mixed-use ${z} at ${far}× FAR typically pairs active ground floor with upper-floor residential or office—${unused} unused sf invites vertical program. Opportunity ${opp}/100; complexity ${comp}/100.${oppNote}`
        : `This district at ${far}× FAR supports mid-rise massing—${unused} unused sf and opportunity ${opp}/100 point to a vertical program; complexity ${comp}/100.${oppNote}`;
    case "tower_candidate":
      return `High FAR (${far}×) on a ${compactSqft(args.lotSqft)} parcel with ${unused} unused buildable sf and opportunity ${opp}/100 reads like a tower or major scrape-and-rebuild lane—subject to views, parking, and code. Complexity ${comp}/100.${oppNote}`;
    default:
      return `${z} at ${far}× FAR with ${unused} unused buildable sf; underbuilt ${opp}/100 and complexity ${comp}/100 align with a general redevelopment screen—confirm uses with counsel before concept design.${oppNote}`;
  }
}

/**
 * “What would I build here?” — heuristic concept from zoning, FAR, lot,
 * unused envelope, underbuilt (opportunity) score, and complexity.
 * Not architecture or investment advice.
 */
export function getVisualConceptSummary(
  property: PropertyRow,
  read: OpportunityEngineRead,
  metrics: PropertyDisplayMetrics,
): VisualConceptSummary {
  const play = read.recommendedPlay.trim();
  const { mixedUse, unknownOrAmbiguous } = getZoningFlags(property.zoning_district);
  const zoning = property.zoning_district ?? "";
  const lot = Math.max(0, num(property.lot_size_sqft));
  const builtFloor = num(property.built_floor_area_sqft);
  const maxF = Math.max(0.01, num(property.max_far));
  const { max_buildable_sqft } = computeFarMetrics(lot, builtFloor, maxF);
  const headroom = Math.min(1, Math.max(0, metrics.remaining_far / maxF));
  const remainingFarRatio = maxF > 0 ? clamp(metrics.remaining_far / maxF, 0, 1) : 0;

  const builtRatio =
    max_buildable_sqft > 0
      ? Math.min(1, builtFloor / max_buildable_sqft)
      : 0;

  const unused = Math.max(0, metrics.unused_buildable_sqft);
  const oppIdx = opportunityDollarIndex(metrics.opportunity_value);
  const hasOpp$ = metrics.opportunity_value != null && metrics.opportunity_value > 0;

  const archetype = classifyArchetype({
    zoning,
    mixedUse,
    unknownZoning: unknownOrAmbiguous,
    maxFar: maxF,
    lotSqft: lot,
    unusedBuildableSqft: unused,
    remainingFarRatio,
    underbuiltScore: metrics.underbuilt_score,
    complexityScore: read.complexityScore,
    opportunityDollarIdx: oppIdx,
    play,
  });

  const suggestedBuildingType = labelForArchetype(archetype, play, mixedUse);

  // Floors scale with headroom; compress for hold / incremental tiers.
  let floorsApprox = Math.round(
    clamp(2 + headroom * 9 + (1 - builtRatio) * 2, 2, 16),
  );
  if (archetype === "hold_monitor") floorsApprox = clamp(floorsApprox, 1, 3);
  else if (archetype === "incremental") floorsApprox = clamp(floorsApprox, 2, 5);
  else if (archetype === "tower_candidate") floorsApprox = clamp(floorsApprox, 8, 22);
  else if (archetype === "mixed_midrise") floorsApprox = clamp(floorsApprox, 4, 14);

  const residentialish =
    /\b(residential|multifamily|multi[-\s]?family|housing|apartment|condo|infill|mid[-\s]?rise)\b/i.test(
      play,
    ) ||
    /\b(r|rm|res|mf|mu)\d*\b/i.test(zoning) ||
    archetype === "multifamily_infill" ||
    (archetype === "mixed_midrise" && mixedUse);

  let unitsApprox: number | null = null;
  if (
    residentialish &&
    unused >= 2500 &&
    archetype !== "hold_monitor" &&
    archetype !== "incremental"
  ) {
    const density = archetype === "tower_candidate" ? 780 : 880;
    unitsApprox = Math.max(4, Math.min(220, Math.round(unused / density)));
  } else if (
    residentialish &&
    unused >= 1200 &&
    archetype === "incremental"
  ) {
    unitsApprox = Math.max(2, Math.min(24, Math.round(unused / 1100)));
  }

  let useMix: string | null = null;
  if (archetype === "industrial") {
    useMix = "Single-user industrial / logistics (illustrative)";
  } else if (mixedUse || archetype === "mixed_midrise") {
    useMix =
      "Street-level retail or flex · upper-floor residential or office (illustrative)";
  } else if (residentialish) {
    useMix = "Primarily residential stack (illustrative)";
  } else if (archetype === "tower_candidate") {
    useMix = "High-rise residential and/or hospitality / office blend (illustrative)";
  }

  const rationale = buildRationale({
    archetype,
    zoning,
    maxFar: maxF,
    lotSqft: lot,
    unusedBuildableSqft: unused,
    underbuiltScore: metrics.underbuilt_score,
    complexityScore: read.complexityScore,
    opportunityDollarIdx: oppIdx,
    hasOpportunityDollars: hasOpp$,
    mixedUse,
  });

  return {
    suggestedBuildingType,
    floorsApprox,
    unitsApprox,
    useMix,
    rationale,
  };
}
