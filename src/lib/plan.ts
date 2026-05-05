/**
 * Plan entitlements: Stripe subscription (see `getPlanAccess`) plus optional
 * manual Pro overrides for testing.
 *
 * Override Pro without Stripe: set one or both in `.env.local`:
 * - `AERVARA_PRO_USER_IDS` — comma-separated Supabase `auth.users` UUIDs
 * - `AERVARA_PRO_EMAILS` — comma-separated emails (matched case-insensitively)
 */

export const FREE_TIER_MAX_PROPERTIES = 5;

function parseCsvSet(raw: string | undefined): Set<string> {
  if (!raw?.trim()) return new Set();
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

function proUserIds(): Set<string> {
  return parseCsvSet(process.env.AERVARA_PRO_USER_IDS);
}

function proEmails(): Set<string> {
  const s = parseCsvSet(process.env.AERVARA_PRO_EMAILS);
  return new Set([...s].map((e) => e.toLowerCase()));
}

export function isProUser(
  userId: string,
  email: string | null | undefined,
): boolean {
  if (proUserIds().has(userId)) return true;
  if (email && proEmails().has(email.trim().toLowerCase())) return true;
  return false;
}

export type PlanEntitlements = {
  isPro: boolean;
  freePropertyLimit: number;
  /** True if the user may create another property on their current plan. */
  canAddMoreProperties: boolean;
  canUseCsvImport: boolean;
  canExportDealPdf: boolean;
  canUseAdvancedDealAnalysis: boolean;
};

export function getEntitlements(
  isPro: boolean,
  currentPropertyCount: number,
): PlanEntitlements {
  return {
    isPro,
    freePropertyLimit: FREE_TIER_MAX_PROPERTIES,
    canAddMoreProperties:
      isPro || currentPropertyCount < FREE_TIER_MAX_PROPERTIES,
    canUseCsvImport: isPro,
    canExportDealPdf: isPro,
    canUseAdvancedDealAnalysis: isPro,
  };
}
