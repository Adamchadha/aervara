import type { SupabaseClient } from "@supabase/supabase-js";
import {
  computeDealRoomAccess,
  computePremiumVisibility,
  effectiveBillingTier,
  fetchBillingRow,
  type BillingRow,
} from "@/lib/billing-access";
import { fetchExclusivityRow } from "@/lib/exclusivity-access";
import { hasEliteAccess, hasProAccess, isAdmin } from "@/lib/plan-gates";
import { FREE_TIER_MAX_PROPERTIES, getEntitlements } from "@/lib/plan";
import type { BillingTier } from "@/types/user-profile";

export type GetPlanAccessOptions = {
  /**
   * `?demo=true` — unlock Pro-tier reads in UI (no billing change).
   * Use `isProPreview` on the result to disable writes.
   */
  isProPreview?: boolean;
};

/** Non-null billing shape used for gates (merges exclusivity `role` when billing row is missing partial data). */
export type GateBillingRow = NonNullable<BillingRow>;

export function mergeBillingForGates(
  billing: BillingRow,
  exclusivity: Awaited<ReturnType<typeof fetchExclusivityRow>>,
): GateBillingRow {
  if (billing) {
    return {
      membership_tier: billing.membership_tier,
      subscription_status: billing.subscription_status,
      stripe_customer_id: billing.stripe_customer_id,
      role: billing.role ?? exclusivity?.role ?? null,
    };
  }
  return {
    membership_tier: null,
    subscription_status: null,
    stripe_customer_id: null,
    role: exclusivity?.role ?? null,
  };
}

export type PlanGateDebug = {
  isAdmin: boolean;
  hasProAccess: boolean;
  hasEliteAccess: boolean;
  membership_tier: string | null;
  role: string | null;
};

export type PlanAccess = ReturnType<typeof getEntitlements> & {
  propertyCount: number;
  billingTier: BillingTier;
  subscriptionStatus: string | null;
  stripeCustomerId: string | null;
  /** Pro (paid or env) — unlocks Deal Room collaboration + advanced analysis. */
  canAccessDealRoom: boolean;
  /** Elite + active subscription — unlocks premium inventory. */
  canViewPremiumProperties: boolean;
  /** True when this session uses URL demo Pro preview (not a paid subscription). */
  isProPreview: boolean;
  /** Env or `user_profiles.role === 'admin'` — hide upgrade / Stripe setup nags. */
  isPlatformAdmin: boolean;
  /** Same as feature UI: `hasProAccess` helper OR demo preview session. */
  hasProAccess: boolean;
  /** Same as premium inventory: `hasEliteAccess` helper OR demo preview session. */
  hasEliteAccess: boolean;
  /** Populated in non-production builds for `PlanGateDebugRibbon`. */
  gateDebug?: PlanGateDebug;
};

export async function countUserProperties(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("properties")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error || count == null) return 0;
  return count;
}

export async function getPlanAccess(
  supabase: SupabaseClient,
  userId: string,
  email: string | null | undefined,
  options?: GetPlanAccessOptions,
): Promise<PlanAccess> {
  const propertyCount = await countUserProperties(supabase, userId);
  const [billingRow, exclusivityRow] = await Promise.all([
    fetchBillingRow(supabase, userId),
    fetchExclusivityRow(supabase, userId),
  ]);
  const merged = mergeBillingForGates(billingRow, exclusivityRow);
  const isProPreview = options?.isProPreview === true;

  const baseHasPro = hasProAccess({ userId, email, billing: merged });
  const baseHasElite = hasEliteAccess({ userId, email, billing: merged });
  const baseDealRoom = computeDealRoomAccess(merged, userId, email);
  const basePremium = computePremiumVisibility(merged, userId, email);

  const canAccessDealRoom = baseDealRoom || isProPreview;
  const canViewPremiumProperties = basePremium || isProPreview;
  const entitlements = getEntitlements(canAccessDealRoom, propertyCount);
  const isPlatformAdmin = isAdmin({ userId, email, billing: merged });

  const hasProAccessFlag = baseHasPro || isProPreview;
  const hasEliteAccessFlag = baseHasElite || isProPreview;

  const gateDebug: PlanGateDebug | undefined =
    process.env.NODE_ENV !== "production"
      ? {
          isAdmin: isAdmin({ userId, email, billing: merged }),
          hasProAccess: hasProAccessFlag,
          hasEliteAccess: hasEliteAccessFlag,
          membership_tier: merged.membership_tier,
          role: merged.role,
        }
      : undefined;

  return {
    propertyCount,
    billingTier: effectiveBillingTier(merged, userId, email),
    subscriptionStatus: merged.subscription_status,
    stripeCustomerId: merged.stripe_customer_id,
    canAccessDealRoom,
    canViewPremiumProperties,
    isProPreview,
    isPlatformAdmin,
    hasProAccess: hasProAccessFlag,
    hasEliteAccess: hasEliteAccessFlag,
    gateDebug,
    ...entitlements,
  };
}

export { FREE_TIER_MAX_PROPERTIES };

export { hasEliteAccess, hasProAccess, isAdmin } from "@/lib/plan-gates";
