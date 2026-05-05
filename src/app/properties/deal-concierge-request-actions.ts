"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const inputSchema = z.object({
  propertyId: z.string().uuid(),
  requesterRole: z.enum([
    "developer",
    "investor",
    "broker",
    "partner",
    "acquisition_team",
    "other",
  ]),
  intent: z.string().trim().min(10).max(4000),
  connectionType: z.enum(["call", "meeting", "intro"]),
  urgency: z.enum(["low", "standard", "high"]),
  message: z.string().trim().max(2000),
});

export type SubmitDealConciergeRequestResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitDealConciergeRequest(
  raw: unknown,
): Promise<SubmitDealConciergeRequestResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error:
        "Please complete all required fields. Describe what you’re looking for in at least a few sentences.",
    };
  }

  const { propertyId, requesterRole, intent, connectionType, urgency, message } =
    parsed.data;

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

  const messageTrimmed = message.length > 0 ? message : null;

  const { error } = await supabase.from("property_deal_concierge_requests").insert({
    property_id: propertyId,
    user_id: user.id,
    requester_role: requesterRole,
    intent,
    connection_type: connectionType,
    urgency,
    message: messageTrimmed,
    status: "new",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
