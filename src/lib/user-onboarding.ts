import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Onboarding completion is stored in JWT user_metadata (works without
 * `public.user_profiles`). When that table exists, we also honor its row.
 */
export function onboardingCompleteFromMetadata(user: User | null): boolean {
  if (!user) return false;
  const v = user.user_metadata?.["onboarding_completed_at"];
  return typeof v === "string" && v.length > 0;
}

function isMissingUserProfilesRelation(error: { message?: string } | null) {
  const m = error?.message ?? "";
  return (
    m.includes("Could not find the table") ||
    m.includes("schema cache") ||
    m.includes("relation \"public.user_profiles\" does not exist") ||
    m.includes("relation 'public.user_profiles' does not exist")
  );
}

export async function hasCompletedOnboarding(
  supabase: SupabaseClient,
  user: User,
): Promise<boolean> {
  if (onboardingCompleteFromMetadata(user)) {
    return true;
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("onboarding_completed_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!error && data?.onboarding_completed_at) {
    return true;
  }

  if (error && !isMissingUserProfilesRelation(error)) {
    // Transient / RLS — treat as incomplete unless metadata already passed above
  }

  return false;
}
