import type { SupabaseClient } from "@supabase/supabase-js";

export type InviteStatus = "pending" | "approved" | "rejected";
export type VerificationStatus = "unverified" | "verified";

type AccessRow = {
  email: string | null;
  is_approved: boolean | null;
  invite_status: string | null;
  role: string | null;
} | null;

function parseCsvSet(raw: string | undefined): Set<string> {
  if (!raw?.trim()) return new Set();
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

function adminIds(): Set<string> {
  return parseCsvSet(process.env.AERVARA_ADMIN_OVERRIDE_USER_IDS);
}

function adminEmails(): Set<string> {
  const s = parseCsvSet(process.env.AERVARA_ADMIN_OVERRIDE_EMAILS);
  return new Set([...s].map((e) => e.toLowerCase()));
}

export function hasAdminOverride(
  userId: string,
  email: string | null | undefined,
): boolean {
  if (adminIds().has(userId)) return true;
  if (email && adminEmails().has(email.trim().toLowerCase())) return true;
  return false;
}

export async function fetchExclusivityRow(
  supabase: SupabaseClient,
  userId: string,
): Promise<AccessRow> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("email, is_approved, invite_status, role")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return null;
  return data as AccessRow;
}

export function parseInviteStatus(raw: string | null | undefined): InviteStatus {
  return raw === "approved" || raw === "rejected" ? raw : "pending";
}

export function parseVerificationStatus(
  raw: string | null | undefined,
): VerificationStatus {
  return raw === "verified" ? "verified" : "unverified";
}

export type PlatformAccessOptions = {
  /** When `searchParams.get("demo") === "true"` — explore without approval. */
  isDemo?: boolean;
  /** Required for `AERVARA_ADMIN_*` env overrides to count as approved. */
  userId?: string;
};

export function isDemoQuery(value: string | null | undefined): boolean {
  return value === "true";
}

export function isApprovedForPlatform(
  profile: AccessRow,
  options?: PlatformAccessOptions,
): boolean {
  if (hasAdminOverride(options?.userId ?? "", profile?.email)) return true;
  if (profile?.role?.trim().toLowerCase() === "admin") return true;
  const isDev = process.env.NODE_ENV === "development";
  const isDemo = options?.isDemo === true;
  return !!profile?.is_approved || isDev || isDemo;
}

/** Strict approval check used by `/apply` (no demo/dev bypass). */
export function isApprovedForApplyFlow(
  profile: AccessRow,
  options?: Pick<PlatformAccessOptions, "userId">,
): boolean {
  if (hasAdminOverride(options?.userId ?? "", profile?.email)) return true;
  if (profile?.role?.trim().toLowerCase() === "admin") return true;
  return !!profile?.is_approved;
}

