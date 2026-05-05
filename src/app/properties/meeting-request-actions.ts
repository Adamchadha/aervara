"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isUserProfilesTableMissing } from "@/lib/user-profile-db";

const inputSchema = z.object({
  propertyId: z.string().uuid(),
  meetingType: z.enum(["in_person", "video_call", "phone_call"]),
  preferredRangeStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferredRangeEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  agenda: z.string().trim().min(5).max(2000),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export type SubmitMeetingRequestResult =
  | { ok: true }
  | { ok: false; error: string };

function parseIsoDate(s: string): Date | null {
  const d = new Date(`${s}T12:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function submitMeetingRequest(
  raw: unknown,
): Promise<SubmitMeetingRequestResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Check meeting type, dates, and agenda (at least 5 characters).",
    };
  }

  const {
    propertyId,
    meetingType,
    preferredRangeStart,
    preferredRangeEnd,
    agenda,
    notes,
  } = parsed.data;

  const start = parseIsoDate(preferredRangeStart);
  const end = parseIsoDate(preferredRangeEnd);
  if (!start || !end || end < start) {
    return {
      ok: false,
      error: "Preferred date range is invalid (end must be on or after start).",
    };
  }

  const notesTrimmed =
    notes == null || notes.trim() === "" ? null : notes.trim();

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

  const { error } = await supabase.from("property_meeting_requests").insert({
    property_id: propertyId,
    user_id: user.id,
    requesting_user_role: requestingUserRole,
    meeting_type: meetingType,
    preferred_range_start: preferredRangeStart,
    preferred_range_end: preferredRangeEnd,
    agenda,
    notes: notesTrimmed,
    status: "new",
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
