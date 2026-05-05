import { hasAdminOverride } from "@/lib/exclusivity-access";
import { isProUser } from "@/lib/plan";
import { parseBillingTier } from "@/types/user-profile";

/**
 * Billing fields used for feature gates (subset of `user_profiles`).
 * Caller may pass `null`/`undefined` when the row is missing — gates treat as free.
 */
export type PlanGateBilling = {
  membership_tier?: string | null;
  subscription_status?: string | null;
  stripe_customer_id?: string | null;
  /** `user_profiles.role` — literal `"admin"` grants full product access (with userId/email). */
  role?: string | null;
} | null | undefined;

export type PlanGateIdentity = {
  userId: string;
  email?: string | null;
};

/**
 * Platform admin: env overrides (`AERVARA_ADMIN_*`) **or** `user_profiles.role === 'admin'`
 * (from `billing.role` or standalone `appRole` when only a partial profile was loaded).
 * Admins bypass Pro/Elite upsells and gates that use these helpers.
 */
export function isAdmin(
  profile: PlanGateIdentity & {
    billing?: PlanGateBilling;
    appRole?: string | null;
  },
): boolean {
  if (hasAdminOverride(profile.userId, profile.email)) return true;
  const r = (profile.appRole ?? profile.billing?.role)?.trim().toLowerCase();
  return r === "admin";
}

/**
 * Pro-tier product access (Deal Room, scenario modeling, CSV import, PDF export, etc.).
 * Admin always; env Pro list; DB `membership_tier` pro or elite (paid or comped).
 */
export function hasProAccess(
  profile: PlanGateIdentity & { billing?: PlanGateBilling },
): boolean {
  if (isAdmin(profile)) return true;
  if (isProUser(profile.userId, profile.email)) return true;
  const tier = parseBillingTier(profile.billing?.membership_tier);
  return tier === "pro" || tier === "elite";
}

/** Elite-tier access (e.g. premium inventory). Admin always; DB tier elite. */
export function hasEliteAccess(
  profile: PlanGateIdentity & { billing?: PlanGateBilling },
): boolean {
  if (isAdmin(profile)) return true;
  const tier = parseBillingTier(profile.billing?.membership_tier);
  return tier === "elite";
}
