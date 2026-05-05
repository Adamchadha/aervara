import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isUserProfilesTableMissing } from "@/lib/user-profile-db";

/**
 * Guarantees a `public.user_profiles` row exists for the signed-in user.
 * DB trigger `on_auth_user_created` is the primary path; this covers password
 * sign-in, edge races, and legacy auth users without a row.
 */
export async function ensureUserProfileFromAuth(
  supabase: SupabaseClient,
  user: User,
): Promise<void> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    if (isUserProfilesTableMissing(error)) return;
    return;
  }

  if (data) return;

  const { error: insertErr } = await supabase.from("user_profiles").insert({
    user_id: user.id,
    email: user.email ?? null,
    role: "investor",
    access_status: "pending",
    is_approved: false,
    invite_status: "pending",
    verification_status: "unverified",
  });

  if (!insertErr) return;
  if (insertErr.code === "23505") return;
}
