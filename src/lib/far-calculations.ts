export type FarMetrics = {
  max_buildable_sqft: number;
  /** Built floor area ÷ lot size (FAR realized on the lot). */
  built_far: number;
  /** Same as remaining FAR: max FAR minus built FAR, floored at 0. */
  far_gap: number;
  remaining_far: number;
  unused_buildable_sqft: number;
};

export type OpportunityMetrics = FarMetrics & {
  current_built_far: number;
  opportunity_value: number | null;
  /** 0–100, whole percent. */
  underbuilt_score: number;
};

function toNonNegativeNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

/**
 * FAR-based buildable metrics. Safe when lot size is 0 (returns zeros / clamps).
 */
export function computeFarMetrics(
  lotSizeSqft: number,
  builtFloorAreaSqft: number,
  maxFar: number,
): FarMetrics {
  const lot = toNonNegativeNumber(lotSizeSqft);
  const built = toNonNegativeNumber(builtFloorAreaSqft);
  const max = toNonNegativeNumber(maxFar);

  if (lot <= 0) {
    return {
      max_buildable_sqft: 0,
      built_far: 0,
      far_gap: max,
      remaining_far: max,
      unused_buildable_sqft: 0,
    };
  }

  const max_buildable_sqft = lot * max;
  const built_far = built / lot;
  const remaining_far = Math.max(0, max - built_far);
  const unused_buildable_sqft = Math.max(0, max_buildable_sqft - built);

  return {
    max_buildable_sqft,
    built_far,
    far_gap: remaining_far,
    remaining_far,
    unused_buildable_sqft,
  };
}

function roundUnderbuiltScore(
  maxFar: number,
  currentBuiltFar: number,
): number {
  if (maxFar <= 0 || !Number.isFinite(maxFar)) return 0;
  const raw = ((maxFar - currentBuiltFar) / maxFar) * 100;
  if (!Number.isFinite(raw)) return 0;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

/**
 * Full opportunity math including optional $/buildable sq ft for value.
 */
export function computeOpportunityMetrics(
  lotSizeSqft: number,
  builtFloorAreaSqft: number,
  maxFar: number,
  estimatedValuePerBuildableSqft: number | null | undefined,
): OpportunityMetrics {
  const base = computeFarMetrics(
    lotSizeSqft,
    builtFloorAreaSqft,
    maxFar,
  );
  const current_built_far = base.built_far;
  const underbuilt_score = roundUnderbuiltScore(maxFar, current_built_far);

  const v = estimatedValuePerBuildableSqft;
  const rate =
    v != null && Number.isFinite(v) && v > 0 ? v : null;
  const opportunity_value =
    rate == null ? null : Math.round(base.unused_buildable_sqft * rate);

  return {
    ...base,
    current_built_far,
    opportunity_value,
    underbuilt_score,
  };
}

/** Fields persisted on `properties` after create/update. */
export type StoredDerivedFields = {
  current_built_far: number;
  remaining_far: number;
  unused_buildable_sqft: number;
  underbuilt_score: number;
  opportunity_value: number | null;
};

export function toStoredDerivedFields(
  m: OpportunityMetrics,
): StoredDerivedFields {
  return {
    current_built_far: m.current_built_far,
    remaining_far: m.remaining_far,
    unused_buildable_sqft: m.unused_buildable_sqft,
    underbuilt_score: m.underbuilt_score,
    opportunity_value: m.opportunity_value,
  };
}

/** Normalized inputs + bar segment widths for built vs remaining FAR UI. */
export type FarBuildoutBarModel = {
  maxFar: number;
  builtFar: number;
  remainingFar: number;
  /** Share of max FAR shown as the built segment (0–100). */
  builtWidthPct: number;
  /** Complement so the bar reads built | remaining across the full width. */
  remainingWidthPct: number;
};

/**
 * Derive horizontal bar percentages: built FAR vs max, remainder as “remaining” track.
 * Safe for missing max FAR and inconsistent remaining inputs.
 */
export function computeFarBuildoutBar(
  currentBuiltFar: number,
  maxFar: number,
  remainingFar: number,
): FarBuildoutBarModel {
  const max = Number.isFinite(maxFar) && maxFar > 0 ? maxFar : 0;
  const built = Math.max(
    0,
    Number.isFinite(currentBuiltFar) ? currentBuiltFar : 0,
  );
  const remaining = Math.max(
    0,
    Number.isFinite(remainingFar) ? remainingFar : max > 0 ? max - built : 0,
  );

  if (max <= 0) {
    return {
      maxFar: 0,
      builtFar: built,
      remainingFar: remaining,
      builtWidthPct: 0,
      remainingWidthPct: 100,
    };
  }

  const builtWidthPct = Math.min(100, Math.max(0, (built / max) * 100));
  const remainingWidthPct = Math.max(0, 100 - builtWidthPct);

  return {
    maxFar: max,
    builtFar: built,
    remainingFar: remaining,
    builtWidthPct,
    remainingWidthPct,
  };
}

export function formatSqft(n: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

/** FAR values shown to 2 decimal places. */
export function formatFar(n: number): string {
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
}

/** USD; whole dollars by default, optional fractional for rates. */
export function formatMoneyUsd(
  n: number | null | undefined,
  maximumFractionDigits: 0 | 1 | 2 = 0,
): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(n);
}

export function formatMoney(n: number | null | undefined): string {
  return formatMoneyUsd(n, 0);
}

/** Whole percent for Underbuilt score display. */
export function formatScorePercent(score: number): string {
  if (!Number.isFinite(score)) return "0%";
  return `${Math.round(score)}%`;
}

export type UnderbuiltTier = "high" | "medium" | "low";

export function underbuiltTier(score: number): UnderbuiltTier {
  if (score >= 80) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export function underbuiltBadgeClass(tier: UnderbuiltTier): string {
  switch (tier) {
    case "high":
      return "border border-emerald-200/90 bg-emerald-50/90 text-emerald-900";
    case "medium":
      return "border border-amber-200/90 bg-amber-50/90 text-amber-950";
    default:
      return "border border-neutral-200/90 bg-neutral-100/80 text-neutral-600";
  }
}
