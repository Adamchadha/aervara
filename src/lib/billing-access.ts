import type { SupabaseClient } from "@supabase/supabase-js";
import { hasEliteAccess, hasProAccess, isAdmin } from "@/lib/plan-gates";
import type { BillingTier } from "@/types/user-profile";
import { parseBillingTier } from "@/types/user-profile";
import { isProUser } from "@/lib/plan";
import { isUserProfilesTableMissing } from "@/lib/user-profile-db";

export type BillingRow = {
  membership_tier: string | null;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  role: string | null;
} | null;

export async function fetchBillingRow(
  supabase: SupabaseClient,
  userId: string,
): Promise<BillingRow> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("membership_tier, subscription_status, stripe_customer_id, role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error && isUserProfilesTableMissing(error)) return null;
  if (error) return null;
  return data as BillingRow;
}

const PAID = new Set(["active", "trialing"]);

export function subscriptionIsPaid(status: string | null | undefined): boolean {
  if (!status) return false;
  return PAID.has(status.toLowerCase());
}

/** Pro-tier features (Deal Room, scenario modeling, etc.). Uses shared `plan-gates`. */
export function computeDealRoomAccess(
  row: BillingRow,
  userId: string,
  email: string | null | undefined,
): boolean {
  return hasProAccess({ userId, email, billing: row });
}

/** Curated / premium inventory visibility (Elite tier or admin). */
export function computePremiumVisibility(
  row: BillingRow,
  userId: string,
  email: string | null | undefined,
): boolean {
  return hasEliteAccess({ userId, email, billing: row });
}

/** Display / logic tier: admin & env-pro floor at Pro; respect elite in DB. */
export function effectiveBillingTier(
  row: BillingRow,
  userId: string,
  email: string | null | undefined,
): BillingTier {
  if (isAdmin({ userId, email, billing: row }) || isProUser(userId, email)) {
    const t = parseBillingTier(row?.membership_tier);
    return t === "elite" ? "elite" : "pro";
  }
  return parseBillingTier(row?.membership_tier);
}
