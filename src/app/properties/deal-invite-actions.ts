"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const inputSchema = z.object({
  propertyId: z.string().uuid(),
  inviteeEmail: z.string().trim().email().max(320),
  inviteeRole: z.enum(["investor", "developer", "broker"]),
  message: z.string().trim().max(2000).optional(),
  simulateEmailSend: z.boolean(),
});

export type SubmitDealInviteResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitDealInvite(raw: unknown): Promise<SubmitDealInviteResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the email address, role, and message length.",
    };
  }

  const { propertyId, inviteeEmail, inviteeRole, message, simulateEmailSend } =
    parsed.data;

  const emailNorm = inviteeEmail.toLowerCase();
  const messageTrimmed =
    message && message.trim().length > 0 ? message.trim() : null;

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

  const { error } = await supabase.from("property_deal_invites").insert({
    property_id: propertyId,
    inviter_user_id: user.id,
    invitee_email: emailNorm,
    invitee_role: inviteeRole,
    message: messageTrimmed,
    email_simulated_at: simulateEmailSend ? new Date().toISOString() : null,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
