"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isUserProfilesTableMissing } from "@/lib/user-profile-db";

const inputSchema = z.object({
  propertyId: z.string().uuid(),
  intent: z.enum(["acquire", "invest", "broker", "partner"]),
  message: z.string().max(2000).nullable().optional(),
});

export type SubmitDealInterestResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitDealInterest(
  raw: unknown,
): Promise<SubmitDealInterestResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  const { propertyId, intent, message } = parsed.data;
  const messageTrimmed =
    message == null || message.trim() === "" ? null : message.trim();

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

  const userRole =
    fromDb ??
    (typeof user.user_metadata?.role === "string"
      ? user.user_metadata.role
      : null);

  if (profileErr && !isUserProfilesTableMissing(profileErr)) {
    return { ok: false, error: profileErr.message };
  }

  const { error } = await supabase.from("property_deal_interests").insert({
    property_id: propertyId,
    user_id: user.id,
    user_role: userRole,
    intent,
    message: messageTrimmed,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
