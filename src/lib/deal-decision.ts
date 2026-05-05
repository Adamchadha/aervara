import { courtPairFeasibility } from "@/lib/amenity-activation";
import { computeProfitMarginOnCostPercent } from "@/lib/development-analysis";
import type { OpportunityEngineRead } from "@/lib/opportunity-engine";

type DealDecisionInput = {
  unusedBuildableSqft: number;
  opportunityValue: number | null;
  maxFar: number;
  underbuiltScore: number;
  estimatedProfit: number | null;
  totalCost: number | null;
  complexityScore: number;
  engineRead: OpportunityEngineRead;
};

export type DealDecision = {
  recommendedPlay: string;
  whyThisWorks: string[];
  keyRisks: string[];
  nextMove: string;
  profitMarginPct: number | null;
  amenityFeasibility: "Low" | "Moderate" | "High";
};

function fmtNum(n: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n));
}

function fmtMoney(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function buildDealDecision(i: DealDecisionInput): DealDecision {
  const unused = Math.max(0, i.unusedBuildableSqft);
  const opp = i.opportunityValue ?? 0;
  const margin = computeProfitMarginOnCostPercent(i.estimatedProfit, i.totalCost);
  const amenity = courtPairFeasibility(unused);

  let recommendedPlay = "Hold / monitor until stronger economics";
  if (opp >= 8_000_000 && unused >= 20_000 && i.underbuiltScore >= 70 && i.maxFar >= 4) {
    recommendedPlay = "Vertical mixed-use redevelopment";
  } else if (unused >= 10_000 && i.underbuiltScore >= 55 && i.maxFar >= 2.5) {
    recommendedPlay = "Targeted infill / expansion play";
  } else if (amenity !== "Low" && i.underbuiltScore >= 45) {
    recommendedPlay = "Rooftop amenity + value-add repositioning";
  }

  const whyThisWorks = [
    `Unused buildable area screens at ${fmtNum(unused)} sq ft, supporting measurable program optionality.`,
    `As-of-right FAR is ${i.maxFar.toFixed(2)} with underbuilt intensity at ${Math.round(i.underbuiltScore)}%.`,
    `Modeled opportunity value is ${fmtMoney(i.opportunityValue)} under current envelope assumptions.`,
    margin != null
      ? `Directional modeled margin is ${margin.toFixed(1)}% on total cost at current inputs.`
      : "Profit margin is not yet fully constrained; further cost and exit inputs are required.",
    `Amenity activation feasibility screens as ${amenity.toLowerCase()} for court/deck use cases.`,
  ];

  const keyRisks = [
    "Construction pricing volatility can compress margin faster than rent assumptions recover.",
    "Exit valuation is sensitive to market depth and comp quality at stabilization.",
    "Entitlement and zoning interpretation can affect achievable program mix and timing.",
    amenity === "High"
      ? "Structural loading, acoustic mitigation, and access routing need early technical confirmation."
      : "Amenity concepts require structural and circulation validation before marketing assumptions.",
  ];

  const nextMove =
    margin != null && margin >= 18 && i.complexityScore <= 40
      ? "Run full underwriting and confirm entitlement assumptions."
      : margin != null && margin >= 10
        ? "Validate rent comps and construction pricing."
        : "Review site constraints before outreach.";

  return {
    recommendedPlay,
    whyThisWorks,
    keyRisks,
    nextMove,
    profitMarginPct: margin,
    amenityFeasibility: amenity,
  };
}

export type SpeedToValueTimeline = {
  entitlementMonths: string;
  designApprovalMonths: string;
  constructionMonths: string;
  stabilizationMonths: string;
  totalMonths: string;
  stabilizationLabel: string;
};

export function buildSpeedToValueTimeline(complexityScore: number): SpeedToValueTimeline {
  const c = Math.max(0, Math.min(100, complexityScore));
  if (c <= 30) {
    return {
      entitlementMonths: "2-4",
      designApprovalMonths: "4-6",
      constructionMonths: "10-14",
      stabilizationMonths: "4-6",
      totalMonths: "20-30",
      stabilizationLabel: "Estimated path to stabilization: 20-30 months",
    };
  }
  if (c <= 60) {
    return {
      entitlementMonths: "4-8",
      designApprovalMonths: "6-9",
      constructionMonths: "12-18",
      stabilizationMonths: "6-9",
      totalMonths: "24-36",
      stabilizationLabel: "Estimated path to stabilization: 24-36 months",
    };
  }
  return {
    entitlementMonths: "8-14",
    designApprovalMonths: "9-14",
    constructionMonths: "16-24",
    stabilizationMonths: "8-12",
    totalMonths: "34-50",
    stabilizationLabel: "Estimated path to stabilization: 34-50 months",
  };
}
