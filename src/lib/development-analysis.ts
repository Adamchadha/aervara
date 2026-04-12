import { computeOpportunityMetrics } from "@/lib/far-calculations";
import type { PropertyRow } from "@/types/property";

/** Default soft cost as a percent of hard construction (e.g. 20 = 20%). */
export const DEFAULT_SOFT_COST_PCT = 20;

export type DevelopmentAnalysisResult = {
  total_buildable_sqft: number;
  unused_buildable_sqft: number;
  construction_cost_per_sqft: number | null;
  soft_cost_percentage: number;
  exit_value_per_sqft_input: number | null;
  /** Exit $/sf used after applying fallback to est. value / buildable sf. */
  effective_exit_per_sqft: number | null;
  construction_cost: number | null;
  soft_cost: number | null;
  total_cost: number | null;
  project_value: number | null;
  estimated_profit: number | null;
};

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function resolveSoftCostPct(p: PropertyRow): number {
  const v = p.soft_cost_percentage;
  if (v == null || !Number.isFinite(Number(v))) return DEFAULT_SOFT_COST_PCT;
  const n = num(v);
  if (n < 0) return DEFAULT_SOFT_COST_PCT;
  if (n > 100) return 100;
  return n;
}

/**
 * Pro forma from unused envelope, construction $/sf, soft %, and exit $/sf
 * (explicit exit or fallback to estimated value per buildable sq ft).
 */
export function computeDevelopmentAnalysis(args: {
  lotSizeSqft: number;
  builtFloorAreaSqft: number;
  maxFar: number;
  estimatedValuePerBuildableSqft: number | null;
  constructionCostPerSqft: number | null;
  softCostPercentage: number | null;
  exitValuePerSqft: number | null;
}): DevelopmentAnalysisResult {
  const o = computeOpportunityMetrics(
    args.lotSizeSqft,
    args.builtFloorAreaSqft,
    args.maxFar,
    args.estimatedValuePerBuildableSqft,
  );
  const unused = o.unused_buildable_sqft;
  const totalBuildable = o.max_buildable_sqft;

  const consPer =
    args.constructionCostPerSqft != null &&
    Number.isFinite(args.constructionCostPerSqft) &&
    args.constructionCostPerSqft > 0
      ? args.constructionCostPerSqft
      : null;

  const softPctRaw = args.softCostPercentage;
  const softPct =
    softPctRaw == null || !Number.isFinite(softPctRaw)
      ? DEFAULT_SOFT_COST_PCT
      : Math.min(100, Math.max(0, softPctRaw));

  const exitExplicit =
    args.exitValuePerSqft != null &&
    Number.isFinite(args.exitValuePerSqft) &&
    args.exitValuePerSqft > 0
      ? args.exitValuePerSqft
      : null;
  const est = args.estimatedValuePerBuildableSqft;
  const estOk =
    est != null && Number.isFinite(est) && est > 0 ? est : null;
  const effectiveExit = exitExplicit ?? estOk;

  const constructionCost =
    consPer != null ? Math.round(unused * consPer) : null;
  const softCost =
    constructionCost != null
      ? Math.round(constructionCost * (softPct / 100))
      : null;
  const totalCost =
    constructionCost != null && softCost != null
      ? constructionCost + softCost
      : null;

  const projectValue =
    effectiveExit != null ? Math.round(unused * effectiveExit) : null;

  const estimatedProfit =
    projectValue != null && totalCost != null
      ? projectValue - totalCost
      : null;

  return {
    total_buildable_sqft: totalBuildable,
    unused_buildable_sqft: unused,
    construction_cost_per_sqft: consPer,
    soft_cost_percentage: softPct,
    exit_value_per_sqft_input: exitExplicit,
    effective_exit_per_sqft: effectiveExit,
    construction_cost: constructionCost,
    soft_cost: softCost,
    total_cost: totalCost,
    project_value: projectValue,
    estimated_profit: estimatedProfit,
  };
}

/**
 * Quick “margin” as yield on total development cost (profit ÷ total cost × 100).
 */
export function computeProfitMarginOnCostPercent(
  estimatedProfit: number | null,
  totalCost: number | null,
): number | null {
  if (
    estimatedProfit == null ||
    totalCost == null ||
    totalCost <= 0 ||
    !Number.isFinite(estimatedProfit) ||
    !Number.isFinite(totalCost)
  ) {
    return null;
  }
  const pct = (estimatedProfit / totalCost) * 100;
  return Number.isFinite(pct) ? pct : null;
}

/** Pro forma on full max buildable envelope (lot × max FAR), not unused-only. */
export type FullBuildableDealResult = {
  total_buildable_sqft: number;
  hard_construction_cost: number | null;
  soft_cost: number | null;
  total_development_cost: number | null;
  total_project_value: number | null;
  estimated_profit: number | null;
  /** profit ÷ project value × 100 when project value is positive. */
  profit_margin_on_project_value: number | null;
};

/**
 * Hard cost = construction $/sf × total buildable; soft = hard × soft %;
 * value = exit $/sf × total buildable; margin = profit ÷ value.
 */
export function computeFullBuildableDeal(args: {
  lotSizeSqft: number;
  maxFar: number;
  constructionCostPerSqft: number | null;
  softCostPercentage: number | null;
  exitValuePerSqft: number | null;
}): FullBuildableDealResult {
  const lot = Math.max(0, num(args.lotSizeSqft));
  const maxF = Math.max(0, num(args.maxFar));
  const totalBuildable = lot * maxF;

  const softPctRaw = args.softCostPercentage;
  const softPct =
    softPctRaw == null || !Number.isFinite(softPctRaw)
      ? DEFAULT_SOFT_COST_PCT
      : Math.min(100, Math.max(0, softPctRaw));

  const cons =
    args.constructionCostPerSqft != null &&
    Number.isFinite(args.constructionCostPerSqft) &&
    args.constructionCostPerSqft > 0
      ? args.constructionCostPerSqft
      : null;

  const exit =
    args.exitValuePerSqft != null &&
    Number.isFinite(args.exitValuePerSqft) &&
    args.exitValuePerSqft > 0
      ? args.exitValuePerSqft
      : null;

  const hard =
    cons != null && totalBuildable > 0
      ? Math.round(cons * totalBuildable)
      : null;
  const soft =
    hard != null ? Math.round(hard * (softPct / 100)) : null;
  const totalDev =
    hard != null && soft != null ? hard + soft : null;

  const projectValue =
    exit != null && totalBuildable > 0
      ? Math.round(exit * totalBuildable)
      : null;

  const profit =
    projectValue != null && totalDev != null
      ? projectValue - totalDev
      : null;

  const marginOnValue =
    projectValue != null &&
    projectValue > 0 &&
    profit != null &&
    Number.isFinite(profit)
      ? (profit / projectValue) * 100
      : null;

  return {
    total_buildable_sqft: totalBuildable,
    hard_construction_cost: hard,
    soft_cost: soft,
    total_development_cost: totalDev,
    total_project_value: projectValue,
    estimated_profit: profit,
    profit_margin_on_project_value:
      marginOnValue != null && Number.isFinite(marginOnValue)
        ? marginOnValue
        : null,
  };
}

export function getDevelopmentAnalysisForProperty(
  p: PropertyRow,
): DevelopmentAnalysisResult {
  const lot = num(p.lot_size_sqft);
  const built = num(p.built_floor_area_sqft);
  const maxF = num(p.max_far);
  const est =
    p.estimated_value_per_sqft == null ? null : num(p.estimated_value_per_sqft);
  const cons =
    p.construction_cost_per_sqft == null
      ? null
      : num(p.construction_cost_per_sqft);
  const exit =
    p.exit_value_per_sqft == null ? null : num(p.exit_value_per_sqft);

  const consN = cons != null && cons > 0 && Number.isFinite(cons) ? cons : null;
  const exitN = exit != null && exit > 0 && Number.isFinite(exit) ? exit : null;

  return computeDevelopmentAnalysis({
    lotSizeSqft: lot,
    builtFloorAreaSqft: built,
    maxFar: maxF,
    estimatedValuePerBuildableSqft: est,
    constructionCostPerSqft: consN,
    softCostPercentage: resolveSoftCostPct(p),
    exitValuePerSqft: exitN,
  });
}
