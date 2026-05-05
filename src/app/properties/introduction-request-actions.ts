"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isUserProfilesTableMissing } from "@/lib/user-profile-db";

const inputSchema = z.object({
  propertyId: z.string().uuid(),
  targetRole: z.enum([
    "developer",
    "investor",
    "broker",
    "partner",
    "acquisition_team",
  ]),
  purpose: z.enum([
    "explore_acquisition",
    "explore_investment",
    "explore_brokerage_marketing",
    "discuss_partnership",
    "general_inquiry",
  ]),
  message: z.string().trim().min(3).max(2000),
});

export type SubmitIntroductionRequestResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitIntroductionRequest(
  raw: unknown,
): Promise<SubmitIntroductionRequestResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Please complete all fields (message at least 3 characters)." };
  }

  const { propertyId, targetRole, purpose, message } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { data: property, error: propError } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (propError || !property) {
    return { ok: false, error: "Property not found." };
  }

  const { data: profileRow, error: profileErr } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  const fromDb =
    !profileErr &&
    profileRow &&
    typeof profileRow.role === "string" &&
    profileRow.role
      ? profileRow.role
      : null;

  const requestingUserRole =
    fromDb ??
    (typeof user.user_metadata?.role === "string"
      ? user.user_metadata.role
      : null);

  if (profileErr && !isUserProfilesTableMissing(profileErr)) {
    return { ok: false, error: profileErr.message };
  }

  const { error } = await supabase
    .from("property_introduction_requests")
    .insert({
      property_id: propertyId,
      user_id: user.id,
      requesting_user_role: requestingUserRole,
      target_role: targetRole,
      purpose,
      message,
      status: "new",
    });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
