"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { recordDealActivity } from "@/lib/property-deal-activity";

const uuidSchema = z.string().uuid("Invalid property id");

const checklistSchema = z.object({
  surrounding_density: z.boolean(),
  neighboring_buildings: z.boolean(),
  access_points: z.boolean(),
  zoning_context: z.boolean(),
  current_use: z.boolean(),
});

export type SiteVisitActionResult = { ok: true } | { ok: false; error: string };

/** Records one “site visit planned” event per property (unique index). */
export async function logSiteVisitPlanned(
  propertyId: string,
): Promise<SiteVisitActionResult> {
  const idParsed = uuidSchema.safeParse(propertyId);
  if (!idParsed.success) {
    return { ok: false, error: "Invalid property." };
  }

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
    .eq("id", idParsed.data)
    .eq("user_id", user.id)
    .maybeSingle();

  if (propError || !property) {
    return { ok: false, error: "Property not found." };
  }

  const res = await recordDealActivity(supabase, {
    userId: user.id,
    propertyId: idParsed.data,
    eventType: "site_visit_planned",
  });

  if (!res.ok) {
    return { ok: false, error: res.error };
  }

  return { ok: true };
}

export async function saveSiteVisitChecklist(
  propertyId: string,
  rawChecklist: unknown,
): Promise<SiteVisitActionResult> {
  const idParsed = uuidSchema.safeParse(propertyId);
  if (!idParsed.success) {
    return { ok: false, error: "Invalid property." };
  }

  const parsed = checklistSchema.safeParse(rawChecklist);
  if (!parsed.success) {
    return { ok: false, error: "Invalid checklist data." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { data: row, error } = await supabase
    .from("properties")
    .update({
      site_visit_checklist: parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", idParsed.data)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }
  if (!row) {
    return { ok: false, error: "Property not found." };
  }

  return { ok: true };
}

export async function saveSiteVisitNotes(
  propertyId: string,
  notes: string,
): Promise<SiteVisitActionResult> {
  const idParsed = uuidSchema.safeParse(propertyId);
  if (!idParsed.success) {
    return { ok: false, error: "Invalid property." };
  }

  const trimmed = notes.trim();
  const payload = trimmed.length > 0 ? trimmed.slice(0, 8000) : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { data: prior } = await supabase
    .from("properties")
    .select("site_visit_notes")
    .eq("id", idParsed.data)
    .eq("user_id", user.id)
    .maybeSingle();

  const priorTrim = (prior?.site_visit_notes as string | null)?.trim() ?? "";

  const { data: row, error } = await supabase
    .from("properties")
    .update({
      site_visit_notes: payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", idParsed.data)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }
  if (!row) {
    return { ok: false, error: "Property not found." };
  }

  if (payload && payload !== priorTrim) {
    const clip =
      payload.length > 160 ? `${payload.slice(0, 159)}…` : payload;
    const logRes = await recordDealActivity(supabase, {
      userId: user.id,
      propertyId: idParsed.data,
      eventType: "notes_added",
      detail: clip,
      metadata: { source: "site_visit" },
    });
    if (!logRes.ok) {
      return { ok: false, error: logRes.error };
    }
  }

  return { ok: true };
}

export async function setSiteVisited(
  propertyId: string,
  visited: boolean,
): Promise<SiteVisitActionResult> {
  const idParsed = uuidSchema.safeParse(propertyId);
  if (!idParsed.success) {
    return { ok: false, error: "Invalid property." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { data: row, error } = await supabase
    .from("properties")
    .update({
      site_visited_at: visited ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", idParsed.data)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }
  if (!row) {
    return { ok: false, error: "Property not found." };
  }

  return { ok: true };
}
